import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Book, Users, Shield, Calculator, Phone, Heart, Brain, GraduationCap,
  FileText, HelpCircle, ChevronRight, Star, Building, DollarSign,
  Info, Calendar, Award, Lightbulb, UserPlus, Home, HandHeart,
  Briefcase, CheckCircle, ArrowRight, Zap, MapPin, Globe
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface ResourceCategory {
  id: number;
  name: string;
  description: string;
  icon: any;
  link: string;
  color: string;
  items?: string[];
  badge?: string;
}

export default function SeniorResourcesCenter() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedResource, setExpandedResource] = useState<number | null>(null);
  const [expandedEducational, setExpandedEducational] = useState<number | null>(null);
  const [expandedSupport, setExpandedSupport] = useState<number | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);

  // Fetch resources data from the database
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/resources'],
  });

  const { data: resourceCategories } = useQuery({
    queryKey: ['/api/resources/categories'],
  });

  const resources = (resourcesData as any)?.resources || [];

  const educationalResources: ResourceCategory[] = [
    {
      id: 1,
      name: "Care Guide",
      description: "Comprehensive guide to senior care options",
      icon: Book,
      link: "/care-guide",
      color: "from-blue-500 to-indigo-500",
      items: ["Types of Care", "Levels of Care", "How to Choose", "Questions to Ask"],
      badge: "ESSENTIAL"
    },
    {
      id: 2,
      name: "Cost Information",
      description: "Understanding senior living costs and financial planning",
      icon: Calculator,
      link: "/costs",
      color: "from-green-500 to-emerald-500",
      items: ["Average Costs", "Payment Options", "Insurance", "Financial Aid"],
      badge: "FINANCIAL"
    },
    {
      id: 3,
      name: "All-In-One Planner",
      description: "Step-by-step planning tools and checklists",
      icon: FileText,
      link: "/all-in-one-planner",
      color: "from-purple-500 to-pink-500",
      items: ["Timeline", "Checklists", "Documents", "Moving Guide"]
    },
    {
      id: 4,
      name: "Memory Care Guide",
      description: "Understanding dementia and Alzheimer's care",
      icon: Brain,
      link: "/memory-care",
      color: "from-orange-500 to-red-500",
      items: ["Warning Signs", "Care Stages", "Communication", "Support"],
      badge: "SPECIALIZED"
    }
  ];

  const supportServices: ResourceCategory[] = [
    {
      id: 5,
      name: "Family Collaboration",
      description: "Tools for families to coordinate care together",
      icon: Users,
      link: "/family-collaboration",
      color: "from-pink-500 to-rose-500",
      items: ["Share Research", "Group Decisions", "Task Management", "Updates"]
    },
    {
      id: 6,
      name: "AI Support Assistant",
      description: "24/7 AI-powered guidance and answers",
      icon: Lightbulb,
      link: "/ai-support",
      color: "from-cyan-500 to-blue-500",
      items: ["Instant Answers", "Personalized Advice", "Care Matching", "Resources"],
      badge: "AI POWERED"
    },
    {
      id: 7,
      name: "Emergency Contacts",
      description: "Quick access to emergency resources",
      icon: Phone,
      link: "/emergency-contacts",
      color: "from-red-500 to-orange-500",
      items: ["911 Access", "Crisis Hotlines", "Local Services", "Safety"],
      badge: "24/7"
    },
    {
      id: 8,
      name: "Support Groups",
      description: "Connect with others on similar journeys",
      icon: HandHeart,
      link: "/support-resources",
      color: "from-teal-500 to-green-500",
      items: ["Online Groups", "Local Meetings", "Caregiver Support", "Forums"]
    }
  ];

  const governmentPrograms: ResourceCategory[] = [
    {
      id: 9,
      name: "Veterans Resources",
      description: "VA benefits and veterans housing options",
      icon: Shield,
      link: "/veterans-housing",
      color: "from-blue-600 to-blue-800",
      items: ["VA Benefits", "Aid & Attendance", "VA Homes", "Resources"],
      badge: "VETERANS"
    },
    {
      id: 10,
      name: "Affordable Housing",
      description: "HUD and subsidized housing programs",
      icon: Building,
      link: "/affordable-housing",
      color: "from-green-600 to-teal-600",
      items: ["HUD Housing", "Section 202", "Low Income", "Subsidies"],
      badge: "HUD"
    },
    {
      id: 11,
      name: "Medicare & Medicaid",
      description: "Government healthcare program information",
      icon: Heart,
      link: "/medicare-medicaid",
      color: "from-purple-600 to-indigo-600",
      items: ["Coverage", "Eligibility", "Applications", "Benefits"]
    },
    {
      id: 12,
      name: "Social Security",
      description: "Benefits and retirement planning",
      icon: DollarSign,
      link: "/social-security",
      color: "from-gray-600 to-gray-800",
      items: ["Benefits Calculator", "Retirement Age", "Disability", "Survivors"]
    }
  ];

  const quickTools: ResourceCategory[] = [
    {
      id: 13,
      name: "Senior Services",
      description: "Local senior services directory",
      icon: Home,
      link: "/senior-services",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 14,
      name: "Legal Resources",
      description: "Elder law and legal documents",
      icon: Briefcase,
      link: "/legal-resources",
      color: "from-gray-500 to-slate-600"
    },
    {
      id: 15,
      name: "Help Center",
      description: "FAQs and platform guidance",
      icon: HelpCircle,
      link: "/help",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: 16,
      name: "Contact Support",
      description: "Get help from our team",
      icon: UserPlus,
      link: "/contact",
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Senior Resources and Support Center
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Your comprehensive hub for education, support, and guidance in senior living decisions
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Book className="h-6 w-6 text-white mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">100+</div>
                  <div className="text-xs text-purple-100">Resources</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-white mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-purple-100">Support</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 text-white mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-xs text-purple-100">Programs</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 text-white mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">Free</div>
                  <div className="text-xs text-purple-100">Access</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Button */}
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => {
                document.getElementById('educational-resources')?.scrollIntoView({ behavior: 'smooth' });
                setExpandedEducational(1); // Expand the Care Guide
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Start with Care Guide
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Database Resources Section */}
      {resources && resources.length > 0 && (
        <section className="px-4 py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Available Resources
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {resources.length}+ resources available for seniors and families
              </p>
            </div>

            {/* Category Filter */}
            {resourceCategories && resourceCategories.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("All")}
                    className="mb-2"
                  >
                    All Resources
                  </Button>
                  {resourceCategories.map((category: any) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className="mb-2"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {resourcesLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading resources...</p>
              </div>
            )}

            {/* Resources Grid */}
            {!resourcesLoading && resources.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .filter((resource: any) => {
                    if (selectedCategory === "All") return true;
                    return resource.category === selectedCategory;
                  })
                  .slice(0, 12)
                  .map((resource: any, index: number) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={resource.url || `/resource/${resource.id}`}>
                        <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-400 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                          <CardHeader className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                <Book className="h-6 w-6" />
                              </div>
                              {resource.type && (
                                <Badge variant="secondary" className="text-xs">
                                  {resource.type}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{resource.name}</CardTitle>
                            <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {resource.category || 'Resource'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="relative z-10">
                            <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                              {resource.description || 'Helpful resource for seniors and families'}
                            </p>
                            {resource.contact && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <Phone className="h-4 w-4" />
                                {resource.contact}
                              </div>
                            )}
                            {resource.website && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <Globe className="h-4 w-4" />
                                Website Available
                              </div>
                            )}
                            <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:text-purple-700 dark:group-hover:text-purple-300">
                              Learn More
                              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Educational Resources Section */}
      <section id="educational-resources" className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Educational Resources
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about senior living options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educationalResources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: resource.id * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-400 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative z-10">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${resource.color} text-white`}>
                        <resource.icon className="h-6 w-6" />
                      </div>
                      {resource.badge && (
                        <Badge className="bg-purple-500 text-white">
                          {resource.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mt-4">{resource.name}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {resource.items && !expandedEducational && (
                      <ul className="space-y-1 mb-4">
                        {resource.items.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Expandable Content */}
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedEducational(expandedEducational === resource.id ? null : resource.id)}
                        className="w-full justify-between text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
                      >
                        {expandedEducational === resource.id ? 'Hide Details' : 'Learn More'}
                        <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedEducational === resource.id ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {expandedEducational === resource.id && (
                        <div className="mt-3 pt-3 space-y-3">
                          {resource.items && (
                            <ul className="space-y-1">
                              {resource.items.map((item, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get Started</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              This resource provides comprehensive information to help you make informed decisions about senior care.
                            </p>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setLocation('/search')}
                              className="w-full"
                            >
                              Search Communities
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Services Section */}
      <section className="px-4 py-12 bg-purple-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Support Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Get help and connect with others
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (service.id - 4) * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-400 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                          <service.icon className="h-6 w-6" />
                        </div>
                        {service.badge && (
                          <Badge className="bg-pink-500 text-white">
                            {service.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mt-4">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      {service.items && (
                        <ul className="space-y-1 mb-4">
                          {service.items.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Star className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* Expandable Content */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSupport(expandedSupport === service.id ? null : service.id)}
                          className="w-full justify-between text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-semibold"
                        >
                          {expandedSupport === service.id ? 'Hide Details' : 'Access Now'}
                          <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedSupport === service.id ? 'rotate-90' : ''}`} />
                        </Button>
                        
                        {expandedSupport === service.id && (
                          <div className="mt-3 pt-3 space-y-3">
                            {service.items && (
                              <ul className="space-y-1">
                                {service.items.map((item, idx) => (
                                  <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Star className="h-3 w-3 text-yellow-500 mr-2 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="mt-4 p-4 bg-pink-50 dark:bg-gray-900 rounded-lg">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Get Support</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Connect with support services and resources tailored to your needs.
                              </p>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setLocation('/search')}
                                className="w-full"
                              >
                                Find Support Services
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Programs Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Government Programs & Benefits
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Official programs and financial assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {governmentPrograms.map((program) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (program.id - 8) * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative z-10 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${program.color} text-white`}>
                          <program.icon className="h-5 w-5" />
                        </div>
                        {program.badge && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {program.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {program.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-0">
                      {program.items && (
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {program.items.slice(0, 4).map((item, idx) => (
                            <span key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                              • {item}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Expandable Content */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                        className="w-full justify-between text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm"
                      >
                        {expandedProgram === program.id ? 'Hide Details' : 'Learn More'}
                        <ArrowRight className={`ml-1 h-3 w-3 transition-transform ${expandedProgram === program.id ? 'rotate-90' : ''}`} />
                      </Button>
                      
                      {expandedProgram === program.id && (
                        <div className="mt-2 pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
                          {program.items && (
                            <div className="grid grid-cols-1 gap-1">
                              {program.items.map((item, idx) => (
                                <span key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                  • {item}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation('/search')}
                            className="w-full mt-2 text-xs"
                          >
                            Find Communities
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-indigo-200 dark:border-indigo-600">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Quick Access Tools</CardTitle>
              <CardDescription className="text-center">
                Frequently used resources and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickTools.map((tool) => (
                  <Button 
                    key={tool.id}
                    variant="outline"
                    className="h-full flex flex-col items-center gap-2 py-4 hover:shadow-lg transition-all hover:border-indigo-400"
                    onClick={() => {
                      if (tool.link === '/search') {
                        setLocation('/search');
                      } else if (tool.link === '/saved') {
                        setLocation('/saved');
                      } else if (tool.link === '/contact') {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      } else if (tool.link === '/faq') {
                        setLocation('/faq');
                      }
                    }}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-center">{tool.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Personalized Guidance?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Our AI assistant can help you navigate all these resources
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => setLocation('/ai-matching-assistant')}
            >
              <Brain className="mr-2 h-5 w-5" />
              Get AI Assistance
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/20"
              onClick={() => setLocation('/family-collaboration')}
            >
              <Users className="mr-2 h-5 w-5" />
              Collaborate with Family
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}