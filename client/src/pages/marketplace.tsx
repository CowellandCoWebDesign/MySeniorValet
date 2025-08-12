import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  ShoppingCart, Stethoscope, Book, ArrowRight, CheckCircle, Users, Building2,
  Heart, Shield, Calculator, TrendingUp, Star, Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [, setLocation] = useLocation();

  const directories = [
    {
      id: 1,
      title: "Community Directory",
      subtitle: "Complete Database Access",
      description: "Access all 34,181+ senior living communities across the United States with verified pricing and real-time availability",
      icon: Building2,
      link: "/community-directory",
      color: "from-blue-600 to-indigo-600",
      stats: {
        count: "34,181+",
        label: "Communities"
      },
      features: [
        "All U.S. Communities",
        "5,936+ HUD Properties",
        "Real-Time Availability",
        "Verified Pricing Data"
      ],
      badge: "PRIMARY DATABASE",
      bgPattern: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      borderColor: "border-blue-500"
    },
    {
      id: 2,
      title: "Senior Marketplace",
      subtitle: "Commercial Vendor Services",
      description: "Professional services for your senior living needs - moving, legal, floral, transportation, and more",
      icon: ShoppingCart,
      link: "/senior-marketplace",
      color: "from-amber-500 to-orange-500",
      stats: {
        count: "1,500+",
        label: "Vendor Services"
      },
      features: [
        "Moving & Relocation",
        "Legal & Financial Services",
        "Transportation Solutions",
        "Personal Services"
      ],
      badge: "COMMERCIAL",
      bgPattern: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      borderColor: "border-amber-400"
    },
    {
      id: 3,
      title: "Senior Healthcare Services Directory",
      subtitle: "Healthcare & Care Providers",
      description: "Connect with verified hospitals, home care, therapy services, and medical professionals",
      icon: Stethoscope,
      link: "/senior-healthcare-directory",
      color: "from-teal-500 to-blue-500",
      stats: {
        count: "6,800+",
        label: "Healthcare Providers"
      },
      features: [
        "6,000+ CMS Hospitals",
        "Home Care Services",
        "Therapy & Rehabilitation",
        "Medical Equipment"
      ],
      badge: "HEALTHCARE",
      bgPattern: "from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20",
      borderColor: "border-teal-400"
    },
    {
      id: 4,
      title: "Senior Resources and Support Center",
      subtitle: "Educational Content & Support",
      description: "Comprehensive guides, government programs, support groups, and educational resources",
      icon: Book,
      link: "/senior-resources-center",
      color: "from-purple-500 to-indigo-500",
      stats: {
        count: "100+",
        label: "Resources"
      },
      features: [
        "Care Planning Guides",
        "Government Programs",
        "Support Groups",
        "Educational Materials"
      ],
      badge: "RESOURCES",
      bgPattern: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
      borderColor: "border-purple-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              MySeniorValet Marketplace Hub
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Your complete ecosystem for senior living - services, healthcare, and resources all in one place
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-white">34,181+</div>
                  <div className="text-xs text-blue-100">Communities</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-white">1,500+</div>
                  <div className="text-xs text-blue-100">Vendors</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-white">6,800+</div>
                  <div className="text-xs text-blue-100">Healthcare</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold text-white">100+</div>
                  <div className="text-xs text-blue-100">Resources</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Four Directory Cards */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Choose Your Directory
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Navigate to the specific marketplace that meets your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {directories.map((directory) => (
              <motion.div
                key={directory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: directory.id * 0.1 }}
              >
                <Link href={directory.link}>
                  <Card className={`h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${directory.borderColor} relative overflow-hidden group transform hover:scale-105`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${directory.bgPattern} opacity-50`}></div>
                    <CardHeader className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${directory.color} text-white shadow-lg`}>
                          <directory.icon className="h-8 w-8" />
                        </div>
                        <Badge className={`bg-gradient-to-r ${directory.color} text-white px-3 py-1`}>
                          {directory.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{directory.title}</CardTitle>
                      <CardDescription className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {directory.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {directory.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-2 mb-6 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {directory.stats.count}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {directory.stats.label}
                        </span>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 mb-6">
                        {directory.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Button className={`w-full bg-gradient-to-r ${directory.color} text-white hover:opacity-90 group-hover:shadow-lg transition-all`}>
                        <span className="font-semibold">Explore Directory</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Navigating Our Marketplace?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Our AI assistant can help you find exactly what you're looking for
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => setLocation('/ai-matching-assistant')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Get AI Assistance
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/20"
              onClick={() => setLocation('/help')}
            >
              <Users className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links Footer */}
      <section className="px-4 py-8 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/vendor-signup">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <Building2 className="mr-2 h-4 w-4" />
                Become a Vendor
              </Button>
            </Link>
            <Link href="/community-payment-program">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <Shield className="mr-2 h-4 w-4" />
                Community Partnership
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <Heart className="mr-2 h-4 w-4" />
                Get Support
              </Button>
            </Link>
            <Link href="/costs">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <Calculator className="mr-2 h-4 w-4" />
                Cost Information
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}