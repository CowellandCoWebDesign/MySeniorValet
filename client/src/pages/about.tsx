import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Heart, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/header";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About MySeniorValet</h1>
          <p className="text-xl mb-8">
            Your Personal Senior Living Concierge - Trusted guidance for your family's most important decision
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span>Founded by William Scott Cowell</span>
            <span>•</span>
            <span>Shasta Lake, California</span>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Home className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold">The Problem</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Families struggle with finding senior living communities due to lack of pricing transparency, 
                  unreliable information, and overwhelming "call for pricing" barriers. Traditional search methods 
                  leave families in the dark about costs and quality.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Heart className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold">Our Solution</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  MySeniorValet eliminates the "call for pricing" problem by providing intelligent pricing estimates, 
                  authentic government data, and transparent community information. We put families first with 
                  honest, comprehensive information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">Transparency</h3>
                <p className="text-gray-600 text-sm">
                  No hidden fees, no "call for pricing" - just honest, upfront information families need to make informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">Family-Centered</h3>
                <p className="text-gray-600 text-sm">
                  Built for families by families. Every feature designed to support collaborative decision-making and family involvement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">Quality</h3>
                <p className="text-gray-600 text-sm">
                  Authentic government data, verified community information, and trusted review sources - no synthetic or placeholder data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Coverage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">8,053+</div>
              <div className="text-gray-600">Communities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">19</div>
              <div className="text-gray-600">States</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">942</div>
              <div className="text-gray-600">Counties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600">Authentic Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Get Started */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of families who have found their perfect senior living community through MySeniorValet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Search Communities
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}