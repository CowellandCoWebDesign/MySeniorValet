import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Building, 
  Shield, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Camera,
  Settings,
  Star,
  ChevronRight,
  Check,
  Sparkles,
  BarChart,
  FileText,
  DollarSign,
  Award,
  Zap,
  Globe,
  Lock,
  HeartHandshake,
  Rocket,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function CommunityPortalModern() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Profile",
      description: "Build trust with families through verified community information and credentials",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Family Connections",
      description: "Direct messaging and tour scheduling to convert more inquiries into residents",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Track profile views, inquiries, and conversion rates with detailed insights",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Media Showcase",
      description: "Upload photos, videos, and virtual tours to showcase your community",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { value: "25,782", label: "Active Communities", trend: "+12%" },
    { value: "89%", label: "Occupancy Rate", trend: "+5%" },
    { value: "4.8", label: "Average Rating", trend: "★★★★★" },
    { value: "24/7", label: "Support Available", trend: "Always" }
  ];

  const testimonials = [
    {
      quote: "MySeniorValet transformed how we connect with families. Our inquiries increased by 200% in just 3 months!",
      author: "Sarah Johnson",
      role: "Executive Director",
      community: "Sunset Gardens Senior Living"
    },
    {
      quote: "The platform's tools saved us hours every week. We can focus on residents instead of paperwork.",
      author: "Michael Chen",
      role: "Community Manager",
      community: "Golden Years Residence"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MySeniorValet
              </span>
              <Badge variant="secondary" className="ml-2">Community Portal</Badge>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation('/community-dashboard/123')}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => setLocation('/login')}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => setLocation('/signup')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-70" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium">
              <Rocket className="w-4 h-4 mr-2" />
              Trusted by 25,000+ Senior Living Communities
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Grow Your Community
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                With Smart Technology
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of senior living communities using MySeniorValet's powerful platform 
              to increase occupancy, streamline operations, and deliver exceptional family experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg group"
                onClick={() => setLocation('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 px-8 py-6 text-lg"
                onClick={() => setLocation('#features')}
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
                <div className="text-sm text-green-600 mt-1">{stat.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">Powerful tools designed for senior living communities</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-2.5 text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Communities Choose
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </span>
              </h2>
              <div className="space-y-4">
                {[
                  "Increase visibility among 50+ million annual searches",
                  "Convert more inquiries with professional tools",
                  "Save 10+ hours per week on administrative tasks",
                  "Access real-time analytics and performance insights",
                  "Get dedicated support from senior living experts"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg"
                className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setLocation('/signup')}
              >
                Get Started Today
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <BarChart className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-semibold mb-2">Performance Tracking</h4>
                    <p className="text-sm text-gray-600">Monitor your community's visibility and engagement</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold mb-2">Direct Messaging</h4>
                    <p className="text-sm text-gray-600">Connect instantly with interested families</p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <FileText className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-semibold mb-2">Digital Leasing</h4>
                    <p className="text-sm text-gray-600">Streamline move-ins with e-signatures</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <DollarSign className="w-8 h-8 text-orange-600 mb-3" />
                    <h4 className="font-semibold mb-2">Payment Processing</h4>
                    <p className="text-sm text-gray-600">Collect rent and fees seamlessly</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600">{testimonial.community}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Community?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of communities already using MySeniorValet to grow occupancy and streamline operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg"
              onClick={() => setLocation('/signup')}
            >
              Start Your Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => setLocation('/contact')}
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-6 h-6 text-white" />
                <span className="text-white font-bold">MySeniorValet</span>
              </div>
              <p className="text-sm">Empowering senior living communities with technology</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 MySeniorValet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}