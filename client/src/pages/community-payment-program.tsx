import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Star, 
  CheckCircle,
  Crown,
  Target,
  Users,
  Calendar,
  Phone,
  MessageSquare,
  BarChart3,
  Zap,
  Award,
  Building,
  Map,
  Clock,
  ArrowRight,
  Gift,
  Lock,
  Eye,
  Megaphone,
  Camera,
  FileText,
  Settings,
  Globe,
  Sparkles
} from "lucide-react";
import { Header } from "@/components/header";

interface PaymentTier {
  id: string;
  name: string;
  monthlyFee: number;
  setupFee: number;
  description: string;
  features: string[];
  priority: number;
  badge: string;
  color: string;
  icon: any;
  revenueShare: string;
  benefits: string[];
  limitations: string[];
}

const paymentTiers: PaymentTier[] = [
  {
    id: "basic-listing",
    name: "Basic Listing",
    monthlyFee: 0,
    setupFee: 0,
    description: "Free listing with basic information and market-based pricing estimates",
    features: [
      "Basic community information",
      "Market-based pricing estimates",
      "Standard search visibility",
      "Basic contact information",
      "Community photos (up to 5)"
    ],
    priority: 4,
    badge: "Free",
    color: "bg-gray-100 border-gray-200",
    icon: Building,
    revenueShare: "0%",
    benefits: [
      "No cost to list",
      "Included in search results",
      "Basic community profile"
    ],
    limitations: [
      "Limited visibility",
      "No priority placement",
      "No direct booking features",
      "Basic analytics only"
    ]
  },
  {
    id: "enhanced-listing",
    name: "Enhanced Listing",
    monthlyFee: 299,
    setupFee: 99,
    description: "Enhanced visibility with verified information and premium features",
    features: [
      "Verified community information",
      "Premium search placement",
      "Enhanced photo gallery (up to 15)",
      "Virtual tour integration",
      "Priority customer support",
      "Basic analytics dashboard"
    ],
    priority: 3,
    badge: "Popular",
    color: "bg-blue-50 border-blue-200",
    icon: Star,
    revenueShare: "5%",
    benefits: [
      "Higher search visibility",
      "Verified badge display",
      "Enhanced photo gallery",
      "Priority support"
    ],
    limitations: [
      "Limited direct booking",
      "Basic lead management",
      "Standard analytics"
    ]
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    monthlyFee: 599,
    setupFee: 199,
    description: "Full-featured listing with direct booking and comprehensive lead management",
    features: [
      "Everything in Enhanced Listing",
      "Direct booking system",
      "Lead management CRM",
      "Advanced analytics",
      "Social media integration",
      "Email marketing tools",
      "Priority phone support",
      "Custom branded profile"
    ],
    priority: 2,
    badge: "Professional",
    color: "bg-purple-50 border-purple-200",
    icon: Crown,
    revenueShare: "8%",
    benefits: [
      "Direct booking capabilities",
      "Full CRM integration",
      "Advanced analytics",
      "Social media promotion"
    ],
    limitations: [
      "Standard ad placement",
      "Basic concierge services"
    ]
  },
  {
    id: "enterprise-monopoly",
    name: "Enterprise Monopoly",
    monthlyFee: 1299,
    setupFee: 499,
    description: "Complete market domination with exclusive features and maximum revenue generation",
    features: [
      "Everything in Premium Plus",
      "Exclusive market area rights",
      "AI-powered lead generation",
      "White-label booking platform",
      "Dedicated account manager",
      "Custom API integration",
      "Unlimited photo/video content",
      "24/7 concierge services",
      "Advanced SEO optimization",
      "Social media management",
      "Review management system",
      "Competitive suppression tools"
    ],
    priority: 1,
    badge: "Monopoly",
    color: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
    icon: Target,
    revenueShare: "15%",
    benefits: [
      "Market monopolization",
      "Exclusive territory rights",
      "Maximum lead generation",
      "Complete competitive advantage"
    ],
    limitations: [
      "Premium investment required",
      "Annual contract commitment"
    ]
  }
];

const revenueStreams = [
  {
    name: "Monthly Subscription Fees",
    description: "Recurring monthly payments from communities",
    estimate: "$500K - $2M annually",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    name: "Setup & Onboarding Fees",
    description: "One-time fees for community setup and integration",
    estimate: "$200K - $800K annually",
    icon: Zap,
    color: "text-blue-600"
  },
  {
    name: "Lead Generation Commissions",
    description: "Commission on successful resident placements",
    estimate: "$1M - $5M annually",
    icon: TrendingUp,
    color: "text-purple-600"
  },
  {
    name: "Booking & Reservation Fees",
    description: "Transaction fees on direct bookings",
    estimate: "$300K - $1.5M annually",
    icon: Calendar,
    color: "text-orange-600"
  },
  {
    name: "Premium Service Add-ons",
    description: "Additional services like virtual tours, photography",
    estimate: "$400K - $2M annually",
    icon: Camera,
    color: "text-pink-600"
  },
  {
    name: "Advertising & Promotion",
    description: "Paid advertising and promotional features",
    estimate: "$600K - $3M annually",
    icon: Megaphone,
    color: "text-red-600"
  }
];

export default function CommunityPaymentProgram() {
  const [selectedTier, setSelectedTier] = useState("premium-plus");

  const totalPotentialRevenue = "$3.5M - $15M annually";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Community Payment Program
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Monopolize your market with our comprehensive payment program. 
            From basic listings to complete market domination - we have the tools to maximize your revenue.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              <DollarSign className="h-5 w-5 mr-2" />
              {totalPotentialRevenue}
            </Badge>
            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
              <Building className="h-5 w-5 mr-2" />
              25,782+ Communities Ready
            </Badge>
          </div>
        </div>

        {/* Payment Tiers */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Market Position</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentTiers.map((tier, index) => (
              <Card 
                key={tier.id} 
                className={`${tier.color} hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500 ${tier.priority === 1 ? 'ring-2 ring-amber-400' : ''}`}
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => setSelectedTier(tier.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-full ${tier.priority === 1 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-blue-100'}`}>
                      <tier.icon className={`h-8 w-8 ${tier.priority === 1 ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  <Badge className={`${tier.priority === 1 ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'} mb-2`}>
                    {tier.badge}
                  </Badge>
                  <CardTitle className="text-xl mb-2">{tier.name}</CardTitle>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      ${tier.monthlyFee}
                      <span className="text-sm font-normal text-gray-600">/month</span>
                    </div>
                    {tier.setupFee > 0 && (
                      <div className="text-sm text-gray-600">
                        ${tier.setupFee} setup fee
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-3">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revenue Share</span>
                      <span className="text-lg font-bold text-green-600">{tier.revenueShare}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full ${tier.priority === 1 ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {tier.priority === 1 ? 'Dominate Market' : 'Choose Plan'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <h2 className="text-3xl font-bold text-center mb-8">Revenue Stream Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revenueStreams.map((stream, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <stream.icon className={`h-6 w-6 ${stream.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{stream.name}</CardTitle>
                      <CardDescription>{stream.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {stream.estimate}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on industry standards and current market size
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Monopoly Strategy */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-600">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Target className="h-8 w-8 text-amber-600" />
                <span>Market Monopolization Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-amber-800">Revenue Maximization</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Tiered Pricing:</strong> Multiple payment levels to capture all market segments</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Revenue Sharing:</strong> Ongoing commission on all bookings and placements</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Premium Services:</strong> High-margin add-on services for additional revenue</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span><strong>Market Dominance:</strong> Exclusive territory rights for top-tier clients</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4 text-amber-800">Competitive Advantages</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span><strong>First-Mover Advantage:</strong> Comprehensive North American coverage</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span><strong>Data Monopoly:</strong> 25,782+ communities with authentic pricing data</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span><strong>Technology Stack:</strong> Advanced AI and automation tools</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span><strong>Brand Recognition:</strong> MySeniorValet market presence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Timeline */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-800">
          <h2 className="text-3xl font-bold text-center mb-8">Implementation Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { phase: "Phase 1", title: "Payment System Setup", duration: "2-3 weeks", tasks: ["Stripe integration", "Billing automation", "Tier management"] },
              { phase: "Phase 2", title: "Community Onboarding", duration: "4-6 weeks", tasks: ["Outreach campaigns", "Sales team training", "Onboarding automation"] },
              { phase: "Phase 3", title: "Feature Rollout", duration: "6-8 weeks", tasks: ["Premium features", "CRM integration", "Analytics dashboard"] },
              { phase: "Phase 4", title: "Market Domination", duration: "Ongoing", tasks: ["Competitive suppression", "Market expansion", "Revenue optimization"] }
            ].map((phase, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <Badge className="bg-blue-600 text-white mb-2 w-fit">{phase.phase}</Badge>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <CardDescription>{phase.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{task}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-1000">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="py-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Monopolize the Market?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Launch your community payment program and start generating revenue from day one. 
                Complete system ready for immediate implementation.
              </p>
              <div className="flex justify-center space-x-4">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Launch Payment Program
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Strategy Call
                  <Phone className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}