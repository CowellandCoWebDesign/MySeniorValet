import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Users, Target, Star, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Mission() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h1>
            <p className="text-xl text-blue-100">
              Empowering families with transparent, authentic senior living guidance
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission Statement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-blue-600" />
              <span>Our Core Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              At MySeniorValet, we believe every family deserves complete transparency and authentic guidance when making senior living decisions. We're committed to eliminating the confusion, hidden fees, and referral-driven advice that has plagued this industry for too long.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Transparency First</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We provide real pricing, authentic reviews, and verified information. No hidden fees, no referral commissions, no misleading information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>Family-Centered</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Every feature we build is designed to support families through this important transition with compassion and understanding.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Verified Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                All our information comes from official government sources, verified APIs, and authentic community data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Community Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We support both families and senior living communities in creating honest, helpful connections.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Stand Against */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-red-600">What We Stand Against</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">❌</Badge>
                <span>Referral fees and hidden commissions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">❌</Badge>
                <span>"Call for pricing" instead of transparent costs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">❌</Badge>
                <span>Misleading or synthetic facility information</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">❌</Badge>
                <span>Pressure tactics and sales-driven advice</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Commitment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-amber-500" />
              <span>Our Commitment to You</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Complete Concierge Service</h4>
                  <p className="text-gray-700">From pricing research to move coordination, we handle everything so you can focus on what matters most.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Authentic Information Only</h4>
                  <p className="text-gray-700">Every piece of data comes from verified sources - government databases, official APIs, and community-provided information.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">No Referral Fees Ever</h4>
                  <p className="text-gray-700">We never accept money from communities to influence our recommendations. Your best interests come first.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Family Collaboration Tools</h4>
                  <p className="text-gray-700">Built-in sharing, notes, and collaboration features help your entire family stay involved in the decision-making process.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/search">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg font-semibold shadow-lg">
              Experience Our Mission in Action
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}