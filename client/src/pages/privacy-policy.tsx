import { NavigationHeader } from "@/components/NavigationHeader";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavigationHeader 
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Last updated: August 7, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet ("we," "our," or "us") is committed to protecting your privacy 
              and personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our mission: "The trusted platform for authentic senior living community 
              information. Helping families make informed decisions with verified data 
              and transparent pricing."
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.1 Personal Information You Provide
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We collect information you voluntarily provide when you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
              <li>Create an account or user profile</li>
              <li>Use our search and matching services</li>
              <li>Subscribe to our services</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or feedback</li>
              <li>Use family collaboration tools</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.2 Information Collected Automatically
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When you use our platform, we automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-6">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and interactions</li>
              <li>Search queries and preferences</li>
              <li>Cookie and tracking data</li>
              <li>Performance and analytics data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.3 Information from Third Parties
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may receive information from:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Government databases (HUD, CMS, state licensing)</li>
              <li>Healthcare facility partners</li>
              <li>Payment processors (Stripe)</li>
              <li>Authentication providers (Replit Auth)</li>
              <li>Analytics and service providers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide and improve our services</li>
              <li>Personalize your experience and search results</li>
              <li>Process payments and subscriptions</li>
              <li>Send important service communications</li>
              <li>Provide customer support</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
              <li>Conduct research and analytics</li>
              <li>Send marketing communications (with consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. AI and Data Processing
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
              <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                AI-Powered Features:
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                MySeniorValet uses multi-AI intelligence orchestration (Claude, Gemini, 
                ChatGPT, Grok) for data verification and search enhancement. Your search 
                queries may be processed by AI services to provide better matching results.
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our AI systems:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Cross-validate data for accuracy</li>
              <li>Enhance search and matching capabilities</li>
              <li>Provide personalized recommendations</li>
              <li>Do not store personal data beyond processing needs</li>
              <li>Follow strict data minimization principles</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share information in these situations:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5.1 Service Providers
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Payment processing (Stripe)</li>
              <li>Email services (SendGrid)</li>
              <li>Analytics and performance monitoring</li>
              <li>Cloud hosting and storage</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5.2 Business Partners
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Senior living communities (with consent)</li>
              <li>Healthcare providers (for referrals)</li>
              <li>Affiliate partners (clearly disclosed)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5.3 Legal Requirements
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may disclose information when required by law, to protect our rights, 
              or to ensure user safety and platform security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We implement comprehensive security measures:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Encryption in transit and at rest</li>
              <li>Secure authentication systems</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and employee training</li>
              <li>Incident response procedures</li>
              <li>Compliance with industry standards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Your Privacy Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request copies of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at Admin@myseniorvalet.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Analyze usage patterns and improve performance</li>
              <li>Provide personalized content and recommendations</li>
              <li>Measure advertising effectiveness</li>
              <li>Ensure platform security</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              You can control cookie settings through your browser preferences. 
              See our Cookie Policy for detailed information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet is not intended for children under 13. We do not knowingly 
              collect personal information from children under 13. If we become aware 
              that a child has provided us with personal information, we will delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other 
              than your own. We ensure appropriate safeguards are in place to protect 
              your information during international transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We retain your personal information only as long as necessary for the 
              purposes outlined in this policy, unless a longer retention period is 
              required by law. When data is no longer needed, we securely delete 
              or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may update this Privacy Policy periodically. We will notify you of 
              material changes by email or through platform notifications. Your 
              continued use of the service after changes constitutes acceptance of 
              the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              For privacy-related questions or requests, contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Privacy Team:</strong> Admin@myseniorvalet.com</li>
                <li><strong>General Contact:</strong> hello@myseniorvalet.com</li>
                <li><strong>Data Protection Officer:</strong> Admin@myseniorvalet.com</li>
                <li><strong>Security Concerns:</strong> William.cowell01@gmail.com</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. State-Specific Privacy Rights
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              California Residents (CCPA/CPRA)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              California residents have additional rights under the California Consumer 
              Privacy Act, including the right to know what personal information is 
              collected, sold, or disclosed, and the right to delete personal information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Virginia Residents (VCDPA)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Virginia residents have rights under the Virginia Consumer Data Protection 
              Act, including rights to access, correct, delete, and port personal data.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To exercise state-specific rights, please contact our privacy team with 
              your state of residence clearly indicated.
            </p>
          </section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              This Privacy Policy is effective as of August 7, 2025, and governs our 
              collection, use, and disclosure of your personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}