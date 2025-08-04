import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Truck, 
  Heart, 
  Shield, 
  Home, 
  Car,
  Briefcase,
  Phone,
  Camera,
  Calendar,
  CreditCard,
  Star,
  Clock,
  MapPin,
  Users,
  FileText,
  Gift,
  Package,
  Zap,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  DollarSign,
  MessageSquare,
  Headphones
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  pricing: string;
  commission: string;
  affiliatePartner: string;
  features: string[];
  availability: "live" | "coming-soon" | "integration-ready";
  priority: "high" | "medium" | "low";
}

const services: Service[] = [
  // Moving & Relocation Services
  {
    id: "moving-services",
    name: "Professional Moving Services",
    description: "Full-service moving with senior-specialized care, packing, and setup",
    icon: Truck,
    category: "moving",
    pricing: "$2,500 - $8,000",
    commission: "8-12%",
    affiliatePartner: "Two Men and a Truck / College Hunks",
    features: ["Senior-specialized packers", "Fragile item protection", "Setup at new location", "Insurance coverage"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "estate-sale",
    name: "Estate Sale & Downsizing",
    description: "Professional estate sale management and downsizing assistance",
    icon: Home,
    category: "moving",
    pricing: "$1,500 - $5,000",
    commission: "15-25%",
    affiliatePartner: "EstateSales.net / MaxSold",
    features: ["Professional appraisal", "Sale management", "Donation coordination", "Clean-out services"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "storage-solutions",
    name: "Storage & Pod Services",
    description: "Temporary and long-term storage solutions during transition",
    icon: Package,
    category: "moving",
    pricing: "$150 - $400/month",
    commission: "10-15%",
    affiliatePartner: "PODS / U-Haul U-Box",
    features: ["Climate-controlled options", "Pick-up and delivery", "Month-to-month flexibility", "Security monitoring"],
    availability: "integration-ready",
    priority: "medium"
  },

  // Healthcare & Medical Services
  {
    id: "prescription-delivery",
    name: "Prescription Delivery",
    description: "Same-day prescription delivery with medication management",
    icon: Heart,
    category: "healthcare",
    pricing: "$15 - $25/delivery",
    commission: "5-8%",
    affiliatePartner: "CVS / Walgreens / PillPack",
    features: ["Same-day delivery", "Medication synchronization", "Pharmacy consultations", "Insurance coordination"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "home-healthcare",
    name: "Home Healthcare Services",
    description: "In-home nursing, therapy, and medical care services",
    icon: Shield,
    category: "healthcare",
    pricing: "$45 - $150/hour",
    commission: "12-18%",
    affiliatePartner: "Visiting Angels / Home Instead",
    features: ["Licensed nurses", "Physical therapy", "Occupational therapy", "Medical equipment"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "telehealth",
    name: "Telehealth Services",
    description: "Virtual healthcare appointments and consultations",
    icon: Phone,
    category: "healthcare",
    pricing: "$75 - $200/session",
    commission: "8-12%",
    affiliatePartner: "Teladoc / Amwell",
    features: ["24/7 availability", "Specialist consultations", "Prescription management", "Health monitoring"],
    availability: "integration-ready",
    priority: "medium"
  },

  // Personal Care Services
  {
    id: "companion-care",
    name: "Companion Care Services",
    description: "Non-medical personal care and companionship services",
    icon: Users,
    category: "personal-care",
    pricing: "$25 - $40/hour",
    commission: "10-15%",
    affiliatePartner: "Care.com / Sittercity",
    features: ["Meal preparation", "Light housekeeping", "Transportation", "Social companionship"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "personal-grooming",
    name: "In-Home Personal Care",
    description: "Assistance with bathing, dressing, and personal hygiene",
    icon: Heart,
    category: "personal-care",
    pricing: "$30 - $50/hour",
    commission: "12-18%",
    affiliatePartner: "Comfort Keepers / Right at Home",
    features: ["Bathing assistance", "Grooming support", "Dressing help", "Mobility assistance"],
    availability: "integration-ready",
    priority: "high"
  },

  // Insurance & Financial Services
  {
    id: "medicare-insurance",
    name: "Medicare & Insurance Planning",
    description: "Medicare supplement and long-term care insurance guidance",
    icon: Shield,
    category: "insurance",
    pricing: "Free consultation",
    commission: "5-15%",
    affiliatePartner: "eHealth / Humana / AARP",
    features: ["Medicare supplement plans", "Long-term care insurance", "Prescription drug coverage", "Annual enrollment"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "financial-planning",
    name: "Senior Financial Planning",
    description: "Specialized financial planning for senior living transitions",
    icon: CreditCard,
    category: "insurance",
    pricing: "$200 - $500/hour",
    commission: "10-20%",
    affiliatePartner: "Financial Planning Association",
    features: ["Asset protection", "Estate planning", "Medicaid planning", "Investment management"],
    availability: "integration-ready",
    priority: "medium"
  },

  // Technology & Communication Services
  {
    id: "tech-support",
    name: "Senior Tech Support",
    description: "Technology setup and ongoing support for seniors",
    icon: Zap,
    category: "technology",
    pricing: "$75 - $150/hour",
    commission: "15-25%",
    affiliatePartner: "Geek Squad / HelloTech",
    features: ["Device setup", "WiFi installation", "App tutorials", "Ongoing support"],
    availability: "integration-ready",
    priority: "medium"
  },
  {
    id: "family-communication",
    name: "Family Communication Tools",
    description: "Video calling and family connection services",
    icon: MessageSquare,
    category: "technology",
    pricing: "$25 - $75/month",
    commission: "8-12%",
    affiliatePartner: "GrandPad / Papa",
    features: ["Simplified video calling", "Photo sharing", "Family updates", "Emergency contacts"],
    availability: "integration-ready",
    priority: "low"
  },

  // Transportation Services
  {
    id: "medical-transport",
    name: "Medical Transportation",
    description: "Specialized transport for medical appointments and procedures",
    icon: Car,
    category: "transportation",
    pricing: "$35 - $85/trip",
    commission: "12-18%",
    affiliatePartner: "MTM / LogistiCare",
    features: ["Wheelchair accessible", "Medical equipment transport", "Insurance billing", "Trained drivers"],
    availability: "integration-ready",
    priority: "high"
  },
  {
    id: "senior-rideshare",
    name: "Senior-Friendly Rideshare",
    description: "Specialized rideshare services for seniors",
    icon: Car,
    category: "transportation",
    pricing: "$15 - $45/ride",
    commission: "5-10%",
    affiliatePartner: "GoGoGrandparent / Senior Planet",
    features: ["Phone-based booking", "Trusted drivers", "Door-to-door service", "Family notifications"],
    availability: "integration-ready",
    priority: "medium"
  },

  // Professional Services
  {
    id: "legal-services",
    name: "Elder Law Services",
    description: "Legal services specialized for senior living and estate planning",
    icon: Briefcase,
    category: "professional",
    pricing: "$300 - $600/hour",
    commission: "8-15%",
    affiliatePartner: "LegalZoom / Nolo",
    features: ["Estate planning", "Power of attorney", "Healthcare directives", "Medicaid planning"],
    availability: "integration-ready",
    priority: "medium"
  },
  {
    id: "real-estate",
    name: "Senior Real Estate Services",
    description: "Specialized real estate services for senior home sales",
    icon: Home,
    category: "professional",
    pricing: "3-6% commission",
    commission: "20-30%",
    affiliatePartner: "Seniors Real Estate Specialists",
    features: ["Market analysis", "Home preparation", "Negotiation support", "Closing coordination"],
    availability: "integration-ready",
    priority: "high"
  }
];

export default function Services() {
  const categoryGroups = [
    { 
      id: "healthcare", 
      name: "Healthcare & Medical", 
      icon: Heart,
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      services: services.filter(s => s.category === "healthcare")
    },
    { 
      id: "personal-care", 
      name: "Personal Care", 
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      services: services.filter(s => s.category === "personal-care")
    },
    { 
      id: "moving", 
      name: "Moving & Transition", 
      icon: Truck,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      services: services.filter(s => s.category === "moving")
    },
    { 
      id: "insurance", 
      name: "Insurance & Financial", 
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      services: services.filter(s => s.category === "insurance")
    },
    { 
      id: "transportation", 
      name: "Transportation", 
      icon: Car,
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      services: services.filter(s => s.category === "transportation")
    },
    { 
      id: "professional", 
      name: "Professional Services", 
      icon: Briefcase,
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      services: services.filter(s => s.category === "professional")
    },
    { 
      id: "technology", 
      name: "Technology Support", 
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      services: services.filter(s => s.category === "technology")
    }
  ];

  const getAvailabilityBadge = (availability: string) => {
    switch(availability) {
      case "live":
        return <Badge className="bg-green-600 text-white">Live</Badge>;
      case "coming-soon":
        return <Badge className="bg-yellow-600 text-white">Coming Soon</Badge>;
      case "integration-ready":
        return <Badge className="bg-blue-600 text-white">Ready for Integration</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 isolate">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <BreadcrumbNavigation 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Healthcare and Care Services Directory' }
            ]}
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Integrated with content flow */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your Complete Healthcare Resource Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6">
            Browse comprehensive healthcare services, medical facilities, caregiving support, and wellness resources. 
            From hospitals and home healthcare to specialized therapies and medical equipment - everything seniors need in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-1.5">
              <CheckCircle className="h-4 w-4 mr-1" />
              {services.filter(s => s.category === "healthcare").length} Healthcare Services
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-4 py-1.5">
              <Heart className="h-4 w-4 mr-1" />
              {services.filter(s => s.category === "personal-care").length} Personal Care Options
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm px-4 py-1.5">
              <Shield className="h-4 w-4 mr-1" />
              {services.filter(s => s.category === "insurance").length} Insurance Services
            </Badge>
            <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm px-4 py-1.5">
              <Users className="h-4 w-4 mr-1" />
              {services.length} Total Services
            </Badge>
          </div>
        </div>

        {/* Visual Category Grid */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryGroups.map((category, index) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className={`group relative overflow-hidden rounded-xl ${category.bgColor} ${category.borderColor} border-2 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${category.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <Badge className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300">
                    {category.services.length} Services
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </a>
            ))}
          </div>
        </div>

        {/* Seamless transition content */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse our comprehensive network of vetted healthcare providers and care services.
            Each service is carefully selected to support seniors and their families through every step of their journey.
          </p>
        </div>

        {/* Services by Category */}
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          {categoryGroups.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-20">
              {/* Category Header */}
              <div className={`rounded-xl ${category.bgColor} ${category.borderColor} border-2 p-6 mb-6`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {category.services.length} services available
                    </p>
                  </div>
                </div>
              </div>

              {/* Services Grid for this Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service, index) => (
            <Card key={service.id} className="hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-gray-800 dark:border-gray-700" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <service.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg dark:text-white">{service.name}</CardTitle>
                      <CardDescription className="dark:text-gray-300">{service.description}</CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  {getAvailabilityBadge(service.availability)}
                  {getPriorityBadge(service.priority)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pricing & Commission */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-400">Service Pricing</span>
                    <span className="text-lg font-bold text-green-900 dark:text-green-300">{service.pricing}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800 dark:text-green-400">Commission Rate</span>
                    <span className="text-lg font-bold text-green-900 dark:text-green-300">{service.commission}</span>
                  </div>
                </div>

                {/* Affiliate Partner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-400">Affiliate Partner</span>
                  </div>
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">{service.affiliatePartner}</span>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button 
                    className="flex-1"
                    disabled={service.availability === "coming-soon"}
                  >
                    {service.availability === "integration-ready" ? "Ready to Integrate" : 
                     service.availability === "live" ? "Launch Service" : "Coming Soon"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Summary */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span>Revenue Opportunity Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {services.filter(s => s.availability === "integration-ready").length}
                  </div>
                  <p className="text-green-800 font-medium">Services Ready for Integration</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {services.filter(s => s.priority === "high").length}
                  </div>
                  <p className="text-blue-800 font-medium">High Priority Revenue Streams</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    $2.5M+
                  </div>
                  <p className="text-purple-800 font-medium">Estimated Annual Revenue Potential</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-800">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Headphones className="h-6 w-6 text-purple-600" />
                <span>Ready to Launch Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800 mb-4">
                All services are research-complete and ready for affiliate program integration. 
                Once approved by affiliate partners, we can launch immediately with full revenue tracking.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Begin Affiliate Applications
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline">
                  View Implementation Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}