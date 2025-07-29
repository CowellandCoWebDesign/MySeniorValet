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
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const powerTools = [
    {
      id: "occupancy-boost",
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Occupancy Boost Calculator",
      description: "See how much revenue you're missing",
      action: "Calculate my potential",
      color: "from-green-500 to-emerald-600",
      stats: { avg: "$47,000/month", time: "in missed revenue" }
    },
    {
      id: "instant-listing",
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Listing Optimizer",
      description: "Fix your listing in 2 minutes",
      action: "Optimize now",
      color: "from-purple-500 to-pink-600",
      stats: { avg: "156%", time: "more inquiries" }
    },
    {
      id: "competitor-spy",
      icon: <BarChart className="w-8 h-8" />,
      title: "Competitor Intelligence",
      description: "See what nearby communities charge",
      action: "View market rates",
      color: "from-blue-500 to-cyan-600",
      stats: { avg: "Real-time", time: "pricing data" }
    },
    {
      id: "lead-magnet",
      icon: <Users className="w-8 h-8" />,
      title: "Lead Capture System",
      description: "Turn browsers into scheduled tours",
      action: "Activate leads",
      color: "from-orange-500 to-red-600",
      stats: { avg: "8x", time: "conversion rate" }
    }
  ];

  const realResults = [
    {
      metric: "$2.4M",
      label: "Additional Revenue Generated",
      detail: "Last 90 days across platform"
    },
    {
      metric: "94%",
      label: "Communities at Full Occupancy",
      detail: "Within 6 months of joining"
    },
    {
      metric: "18 hrs",
      label: "Average Response Time",
      detail: "Down from 3-5 days"
    },
    {
      metric: "4.9★",
      label: "Family Satisfaction",
      detail: "From 12,847 reviews"
    }
  ];

  const testimonials = [
    {
      quote: "We went from 78% to 96% occupancy in 4 months. The ROI calculator showed us exactly where we were losing money.",
      author: "Maria Rodriguez",
      role: "Owner",
      community: "Heritage Oaks Memory Care",
      revenue: "+$124,000/mo"
    },
    {
      quote: "The competitor pricing tool is a game-changer. We were underpriced by $800/month!",
      author: "David Thompson",
      role: "Executive Director",
      community: "Evergreen Senior Living",
      revenue: "+$76,000/mo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Modern Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
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
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
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
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 opacity-70 dark:opacity-30" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 rounded-full px-4 py-2 text-sm font-medium">
              <Rocket className="w-4 h-4 mr-2" />
              Trusted by 25,000+ Senior Living Communities
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Grow Your Community
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                With Smart Technology
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Real Results Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12 text-gray-900 dark:text-white">
            Real Results From Real Communities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {realResults.map((result, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {result.metric}
                </div>
                <div className="text-gray-800 dark:text-gray-200 font-semibold mt-2">{result.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Power Tools Section */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Free Tools That Generate Results
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              See your potential revenue before you sign up
            </p>
            <Badge className="text-sm px-4 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              No credit card required
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {powerTools.map((tool, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-2xl transition-all duration-300 border-0 dark:bg-gray-900 cursor-pointer transform hover:-translate-y-2"
                onClick={() => setSelectedTool(tool.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${tool.color} p-3 text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{tool.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{tool.stats.avg}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{tool.stats.time}</div>
                    </div>
                    <Button className={`w-full bg-gradient-to-r ${tool.color} text-white hover:opacity-90`}>
                      {tool.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
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
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
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
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardContent className="p-6">
                    <BarChart className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Performance Tracking</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your community's visibility and engagement</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardContent className="p-6">
                    <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Direct Messaging</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Connect instantly with interested families</p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardContent className="p-6">
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Digital Leasing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Streamline move-ins with e-signatures</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg dark:bg-gray-800">
                  <CardContent className="p-6">
                    <DollarSign className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Payment Processing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Collect rent and fees seamlessly</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg dark:bg-gray-900">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg italic mb-6 text-gray-800 dark:text-gray-200">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{testimonial.community}</p>
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
              className="border-2 border-white text-white hover:bg-white/20 hover:border-white px-8 py-6 text-lg"
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
      <footer className="py-12 px-4 bg-gray-900 dark:bg-gray-950 text-gray-400">
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
          <div className="mt-8 pt-8 border-t border-gray-800 dark:border-gray-700 text-center text-sm">
            <p>&copy; 2025 MySeniorValet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}