import { NavigationHeader } from "@/components/NavigationHeader";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavigationHeader 
        title="Terms of Service"
        subtitle="Legal agreement governing platform usage"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Last updated: August 7, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              By accessing and using MySeniorValet ("Platform," "Service," "we," "us," or "our"), 
              you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              MySeniorValet is a transparency platform providing verified information about 
              senior living communities and healthcare resources across North America.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet provides:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Verified information about senior living communities</li>
              <li>HUD-verified pricing data where available</li>
              <li>Healthcare facility directories and ratings</li>
              <li>AI-powered search and matching services</li>
              <li>Family collaboration tools for care decisions</li>
              <li>Vendor marketplace for senior services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Responsibilities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Users agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate and truthful information when creating accounts</li>
              <li>Use the service only for lawful purposes</li>
              <li>Respect the intellectual property rights of MySeniorValet and third parties</li>
              <li>Not attempt to access unauthorized areas of the platform</li>
              <li>Not interfere with or disrupt the service</li>
              <li>Verify all information independently before making care decisions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Accuracy and Verification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet maintains strict data integrity standards:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>HUD properties display only verified government pricing</li>
              <li>Communities without verified pricing show "Contact for pricing"</li>
              <li>Multi-AI verification system ensures data accuracy</li>
              <li>Regular updates from authoritative sources</li>
              <li>No synthetic, mock, or placeholder data is used</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              While we strive for accuracy, users must independently verify all information 
              before making care decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Your privacy is important to us. Our Privacy Policy, which is incorporated 
              into these Terms by reference, explains how we collect, use, and protect 
              your information. By using our service, you consent to our privacy practices.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect personal information 
              and comply with applicable data protection regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Subscription Services and Payment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet offers various subscription tiers:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Community Tiers:</h4>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                  <li>Verified Listing: $0/month</li>
                  <li>Standard: $149/month</li>
                  <li>Featured: $249/month</li>
                  <li>Platinum: $349/month</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Tiers:</h4>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                  <li>Basic: $99/month (1 state)</li>
                  <li>Featured: $249/month (up to 3 states)</li>
                  <li>National Partner: $499/month (nationwide)</li>
                </ul>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All payments are processed securely through Stripe. Subscriptions renew 
              automatically unless cancelled. Refunds are subject to our refund policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The MySeniorValet platform, including all content, features, and functionality, 
              is owned by MySeniorValet and is protected by copyright, trademark, and other 
              intellectual property laws.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Users may not reproduce, distribute, modify, or create derivative works 
              without explicit written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Disclaimers and Limitations of Liability
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
              <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                IMPORTANT DISCLAIMER:
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                MySeniorValet is an information platform only. We do not provide medical 
                advice, care recommendations, or guarantee the availability or quality of 
                services from listed providers. All care decisions should be made in 
                consultation with qualified healthcare professionals.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE 
              MAXIMUM EXTENT PERMITTED BY LAW, MYSENIORVALET DISCLAIMS ALL WARRANTIES, 
              EXPRESS OR IMPLIED.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              MySeniorValet's liability is limited to the maximum extent permitted by law. 
              We are not liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Third-Party Services and Affiliates
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet may contain links to third-party websites and services. 
              We may also earn commissions from qualified referrals to partner services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All affiliate relationships and potential commissions are clearly disclosed. 
              We are not responsible for the content or practices of third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Either party may terminate this agreement at any time. MySeniorValet 
              reserves the right to suspend or terminate accounts that violate these terms.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Upon termination, your right to use the service ceases immediately, 
              though certain provisions of these terms will survive termination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet reserves the right to modify these terms at any time. 
              Users will be notified of material changes, and continued use of the 
              service constitutes acceptance of modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Governing Law and Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              These terms are governed by the laws of the jurisdiction where MySeniorValet 
              operates. Any disputes will be resolved through binding arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>General Inquiries:</strong> hello@myseniorvalet.com</li>
                <li><strong>Administration:</strong> Admin@myseniorvalet.com</li>
                <li><strong>Billing Department:</strong> billing@myseniorvalet.com</li>
                <li><strong>Founder:</strong> William.cowell01@gmail.com</li>
                <li><strong>Technical Support:</strong> CowellandCoWebDesign@gmail.com</li>
                <li><strong>Mission:</strong> "The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing."</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              By using MySeniorValet, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}