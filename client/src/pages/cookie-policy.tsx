import { useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Settings, Shield, BarChart3, Target } from "lucide-react";

export default function CookiePolicy() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always enabled
    analytics: true,
    marketing: false,
    personalization: true
  });

  const handlePreferenceChange = (category: string, enabled: boolean) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
    
    // Store preferences in localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify({
      ...preferences,
      [category]: enabled
    }));
  };

  const cookieCategories = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'Required for basic site functionality and security',
      icon: Shield,
      enabled: preferences.essential,
      required: true,
      examples: [
        'User authentication and session management',
        'Security tokens and CSRF protection',
        'Load balancing and performance optimization',
        'Basic site preferences and settings'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Performance',
      description: 'Help us understand how users interact with our platform',
      icon: BarChart3,
      enabled: preferences.analytics,
      required: false,
      examples: [
        'Page views and user journey tracking',
        'Search patterns and feature usage',
        'Performance monitoring and error tracking',
        'A/B testing and feature optimization'
      ]
    },
    {
      id: 'personalization',
      name: 'Personalization',
      description: 'Enable personalized content and search results',
      icon: Settings,
      enabled: preferences.personalization,
      required: false,
      examples: [
        'Customized search results and recommendations',
        'Saved preferences and favorites',
        'Location-based content delivery',
        'AI-powered matching improvements'
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Advertising',
      description: 'Deliver relevant advertisements and measure campaign effectiveness',
      icon: Target,
      enabled: preferences.marketing,
      required: false,
      examples: [
        'Targeted advertising based on interests',
        'Social media integration and sharing',
        'Email marketing campaign tracking',
        'Affiliate and partner referral tracking'
      ]
    }
  ];

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    // Reload page to apply new cookie settings
    window.location.reload();
  };

  const acceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    setPreferences(allEnabled);
    localStorage.setItem('cookiePreferences', JSON.stringify(allEnabled));
    window.location.reload();
  };

  const rejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavigationHeader 
        title="Cookie Policy"
        subtitle="How we use cookies and tracking technologies"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 mb-8">
            <Cookie className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Cookie Policy
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Last updated: August 7, 2025
              </p>
            </div>
          </div>

          {/* Cookie Preferences Management */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Manage Your Cookie Preferences
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Control which cookies MySeniorValet can use to enhance your experience. 
              Changes will take effect immediately after saving.
            </p>
            
            <div className="space-y-6">
              {cookieCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">
                              {category.name}
                              {category.required && (
                                <Badge variant="secondary" className="ml-2">Required</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={category.enabled}
                          onCheckedChange={(enabled) => handlePreferenceChange(category.id, enabled)}
                          disabled={category.required}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Examples:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {category.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button onClick={savePreferences} className="bg-blue-600 hover:bg-blue-700">
                Save Preferences
              </Button>
              <Button onClick={acceptAll} variant="outline">
                Accept All
              </Button>
              <Button onClick={rejectOptional} variant="outline">
                Reject Optional
              </Button>
            </div>
          </div>

          {/* Policy Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Cookies are small text files stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              analyzing how you use our service, and personalizing content.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              MySeniorValet uses both first-party cookies (set by us) and third-party cookies 
              (set by our service providers and partners) to enhance functionality and 
              provide insights into platform usage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Types of Cookies We Use
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Session vs. Persistent Cookies
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  By Purpose
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Functional</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable core website features like login, search preferences, and theme settings
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Protect against fraud, ensure secure authentication, and maintain session integrity
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monitor site speed, identify errors, and optimize user experience
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Understand user behavior, measure feature adoption, and improve services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Third-Party Cookies and Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              MySeniorValet integrates with trusted third-party services that may set their own cookies:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service Providers</h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                  <li><strong>SendGrid:</strong> Email delivery and engagement tracking</li>
                  <li><strong>Replit Auth:</strong> Authentication and user management</li>
                  <li><strong>Analytics Services:</strong> Usage tracking and performance monitoring</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Partners</h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>OpenAI (ChatGPT):</strong> AI-powered search and recommendations</li>
                  <li><strong>Anthropic (Claude):</strong> Data verification and analysis</li>
                  <li><strong>Google (Gemini):</strong> Enhanced search capabilities</li>
                  <li><strong>xAI (Grok):</strong> Advanced intelligence features</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Cookie Duration and Storage
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Cookie Type</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Duration</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Session Authentication</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Session</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">User login and security</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">User Preferences</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">1 year</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Theme, language, search settings</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Analytics</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">2 years</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Usage patterns and improvement</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Marketing</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">30 days</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">Ad targeting and campaign tracking</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Managing Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You can control cookies through:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Platform Settings</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Use the cookie preference manager above to customize which types of cookies MySeniorValet can use.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Browser Controls</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Most browsers allow you to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>View and delete cookies</li>
                  <li>Block cookies from specific sites</li>
                  <li>Block third-party cookies</li>
                  <li>Clear all cookies when closing the browser</li>
                  <li>Set exceptions for trusted sites</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Browser-Specific Instructions</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Impact of Disabling Cookies
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-4">
              <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                Important Notice:
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Disabling certain cookies may limit functionality and personalization features. 
                Essential cookies cannot be disabled as they are necessary for basic site operation.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Limited Functionality</h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <li>Login and authentication issues</li>
                  <li>Reduced search personalization</li>
                  <li>Loss of saved preferences</li>
                  <li>Decreased performance optimization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reduced Experience</h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <li>Less relevant community recommendations</li>
                  <li>Repeated consent requests</li>
                  <li>Generic content instead of personalized</li>
                  <li>Inability to track user journey analytics</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Updates to This Cookie Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may update this Cookie Policy periodically to reflect changes in our 
              practices, services, or applicable regulations. We will notify users of 
              material changes through platform notifications or email.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your continued use of MySeniorValet after policy updates constitutes 
              acceptance of the revised terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              For questions about our use of cookies or this policy, contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Privacy Team:</strong> admin@myseniorvalet.com</li>
                <li><strong>General Inquiries:</strong> hello@myseniorvalet.com</li>
                <li><strong>Technical Support:</strong> hello@myseniorvalet.com</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              This Cookie Policy is effective as of August 7, 2025, and applies to all 
              cookies used by MySeniorValet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}