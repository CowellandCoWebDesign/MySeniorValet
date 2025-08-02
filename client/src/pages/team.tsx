import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Mail, Globe, Heart, Code, Database } from "lucide-react";
import { Link } from "wouter";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <NavigationHeader 
        title="Meet the Team" 
        subtitle="The person behind MySeniorValet's mission"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Founder Profile */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">William Scott Cowell</CardTitle>
                <p className="text-gray-600">Founder & CEO</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">About Scott</h3>
                <p className="text-gray-700 mb-4">
                  Scott founded MySeniorValet with a clear mission: to eliminate the confusion and hidden fees that families face when searching for senior living options. As a sole proprietor, he's built this platform from the ground up to serve families with complete transparency and authentic guidance.
                </p>
                <p className="text-gray-700 mb-4">
                  With a background in web development and a passion for helping families navigate complex decisions, Scott has created a comprehensive platform that covers over 31,000 communities across all 50 states and territories, with plans for international expansion.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Code className="w-3 h-3" />
                    <span>Full-Stack Developer</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>Data Engineer</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Family Advocate</span>
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">California, USA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href="mailto:info@myseniorvalet.com" className="text-blue-600 hover:text-blue-700">
                    info@myseniorvalet.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a href="https://cowellandcowebdesign.github.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    cowellandcowebdesign.github.io
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vision & Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scott's Vision for MySeniorValet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-600">Transparency Revolution</h4>
                <p className="text-gray-700">
                  "I believe every family deserves to know the real costs upfront. No more 'call for pricing' - every community should display honest, transparent pricing."
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600">Anti-Referral Fee Mission</h4>
                <p className="text-gray-700">
                  "We never accept referral fees or commissions. This platform exists to serve families, not to generate sales leads for communities."
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600">Complete Concierge Service</h4>
                <p className="text-gray-700">
                  "From pricing research to move coordination, prescription delivery to furniture setup - we handle everything so families can focus on what matters most."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">8,053</div>
                <div className="text-sm text-gray-600">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">19</div>
                <div className="text-sm text-gray-600">States</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">942</div>
                <div className="text-sm text-gray-600">Counties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-600">Authentic Data</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Join Our Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Join Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              While MySeniorValet is currently a solo operation, Scott is always looking for ways to serve families better. If you're passionate about senior living transparency and want to contribute to our mission, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  Get in Touch
                </button>
              </Link>
              <Link href="/search">
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                  Explore Our Platform
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}