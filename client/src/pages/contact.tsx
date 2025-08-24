import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Globe, Phone, Clock } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Contact Us" 
        subtitle="Get in touch with MySeniorValet"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact MySeniorValet</h1>
          <p className="text-xl mb-8">
            We're here to help you find the perfect senior living community for your family
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">Email</div>
                      <a href="mailto:hello@myseniorvalet.com" className="text-blue-600 hover:text-blue-700">
                        hello@myseniorvalet.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">Business Address</div>
                      <div className="text-gray-600">Contact for business inquiries</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Website</div>
                      <a 
                        href="https://cowellandcowebdesign.github.io" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        cowellandcowebdesign.github.io
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <div className="font-medium">Response Time</div>
                      <div className="text-gray-600">Within 24 hours</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Why I Built This</h3>
                  <p className="text-blue-800 text-sm">
                    MySeniorValet exists to put power back in families' hands. I watched too many loved ones struggle 
                    through the overwhelming process of finding senior care, frustrated by hidden costs, fake reviews, 
                    and incomplete information scattered across dozens of websites. This platform brings everything 
                    together—34,000+ communities, healthcare facilities, senior services, and government resources—all 
                    with transparent pricing and authentic information. We never sell your data. We never charge families. 
                    We never hide communities behind paywalls. Because when families have complete information, they make 
                    confident decisions. That's the transparency revolution we're leading in senior living.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="community">Community Information</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="feedback">Feedback & Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How do I search for communities?</h3>
                <p className="text-gray-600 text-sm">
                  Use our search page to find communities by location, care type, pricing, and amenities. 
                  All search results include transparent pricing and authentic community information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Are your prices accurate?</h3>
                <p className="text-gray-600 text-sm">
                  We provide intelligent pricing estimates based on authentic market data, government sources, 
                  and state-specific algorithms. Prices are clearly marked as estimates and should be verified with communities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">How can I share communities with family?</h3>
                <p className="text-gray-600 text-sm">
                  Use our family collaboration features to share community details, add personal notes, 
                  and coordinate with family members. Each community page includes easy sharing options.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Do you cover affordable housing options?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! We include HUD Section 202 and 811 affordable housing, HUD-VASH veterans housing, 
                  and other government-subsidized options for seniors and disabled adults.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}