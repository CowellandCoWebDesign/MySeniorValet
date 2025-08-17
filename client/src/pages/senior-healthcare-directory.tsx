import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import HospitalCarousel from "@/components/HospitalCarousel";
import { CareServiceCard } from "@/components/CareServiceCard";
import { 
  Stethoscope, Home, Activity, Users, Heart, Brain, Shield, Monitor,
  Pill, ChevronRight, CheckCircle, MapPin, Clock, Phone, Star,
  Zap, HeartHandshake, UserCheck, Calendar, AlertCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

interface HealthcareService {
  id: number;
  name: string;
  category: string;
  description: string;
  providerCount: number;
  verified: boolean;
  icon: any;
  link: string;
  color: string;
  badge?: string;
}

export default function SeniorHealthcareDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Fetch care services data
  const { data: careServicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/care-services'],
  });

  const { data: careServicesAnalytics } = useQuery({
    queryKey: ['/api/care-services/analytics/summary'],
  });

  // Fetch hospitals data
  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  const services = (careServicesData as any)?.services || [];
  const hospitals = (hospitalsData as any)?.hospitals || [];

  const healthcareServices: HealthcareService[] = [
    {
      id: 1,
      name: "Hospital Services",
      category: "Medical Centers",
      description: "6,000+ CMS verified hospitals",
      providerCount: 6000,
      verified: true,
      icon: Stethoscope,
      link: "/hospitals",
      color: "from-blue-500 to-cyan-500",
      badge: "CMS RATED"
    },
    {
      id: 2,
      name: "Home Care Services",
      category: "In-Home Care",
      description: "Licensed caregivers for in-home support",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Home Care').length || 850,
      verified: true,
      icon: Home,
      link: "/home-care",
      color: "from-green-500 to-emerald-500",
      badge: "24/7"
    },
    {
      id: 3,
      name: "Therapy Services",
      category: "Rehabilitation",
      description: "Physical, occupational, and speech therapy",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Therapy Services').length || 450,
      verified: true,
      icon: Activity,
      link: "/therapy-services",
      color: "from-purple-500 to-indigo-500",
      badge: "PT/OT/SPEECH"
    },
    {
      id: 4,
      name: "Companion Care",
      category: "Social Support",
      description: "Social companionship and daily activities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Companion Care').length || 320,
      verified: true,
      icon: Users,
      link: "/companion-care",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: 5,
      name: "Personal Care",
      category: "ADL Support",
      description: "Assistance with daily living activities",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Personal Care').length || 280,
      verified: true,
      icon: Heart,
      link: "/personal-care",
      color: "from-red-500 to-orange-500"
    },
    {
      id: 6,
      name: "Memory Care",
      category: "Dementia Support",
      description: "Specialized dementia and Alzheimer's care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Memory Care').length || 200,
      verified: true,
      icon: Brain,
      link: "/memory-care",
      color: "from-indigo-500 to-purple-500",
      badge: "SPECIALIZED"
    },
    {
      id: 7,
      name: "Hospice Care",
      category: "End-of-Life Care",
      description: "Compassionate end-of-life support",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Hospice').length || 150,
      verified: true,
      icon: HeartHandshake,
      link: "/hospice-care",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: 8,
      name: "Medical Equipment",
      category: "DME Providers",
      description: "Durable medical equipment and supplies",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Medical Equipment').length || 175,
      verified: true,
      icon: Monitor,
      link: "/medical-equipment",
      color: "from-gray-500 to-slate-500"
    },
    {
      id: 9,
      name: "Nursing Services",
      category: "Skilled Nursing",
      description: "RN and LPN skilled nursing care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Nursing').length || 225,
      verified: true,
      icon: UserCheck,
      link: "/nursing-services",
      color: "from-blue-600 to-indigo-600",
      badge: "RN/LPN"
    }
  ];

  // Calculate total providers
  const totalProviders = (careServicesAnalytics as any)?.totalServices || 
    healthcareServices.reduce((sum, service) => sum + service.providerCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Senior Healthcare Services Directory
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Connect with {totalProviders?.toLocaleString() || '4,210'}+ verified healthcare and caregiving services in your area
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Stethoscope className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">6,000+</div>
                  <div className="text-sm text-blue-100">Hospitals</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Home className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {(careServicesAnalytics as any)?.homeCare || '850+'}
                  </div>
                  <div className="text-sm text-blue-100">Home Care</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-blue-100">Verified</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Button */}
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => setLocation('/care-guide')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Browse Care Guide
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Healthcare Services Grid */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Healthcare Service Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Find the right healthcare providers for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthcareServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: service.id * 0.05 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-teal-400 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                        <service.icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          VERIFIED
                        </Badge>
                        {service.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {service.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {service.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {service.providerCount.toLocaleString()} providers
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCategory(expandedCategory === service.name ? null : service.name)}
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold"
                      >
                        {expandedCategory === service.name ? 'Hide' : 'View All'}
                        <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedCategory === service.name ? 'rotate-90' : ''}`} />
                      </Button>
                    </div>
                    
                    {/* Expanded Provider List */}
                    {expandedCategory === service.name && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {servicesLoading ? (
                          <div className="text-center py-4">
                            <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {service.name === "Hospital Services" && hospitals.length > 0 ? (
                              hospitals.slice(0, 5).map((hospital: any) => (
                                <div key={hospital.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="font-medium text-sm">{hospital.name}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {hospital.city}, {hospital.state} • {hospital.phone}
                                  </div>
                                  {hospital.cms_rating && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {[...Array(hospital.cms_rating)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : services.filter((s: any) => s.serviceCategory === service.category).slice(0, 5).map((provider: any) => (
                              <div key={provider.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="font-medium text-sm">{provider.providerName || provider.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {provider.phone} • {provider.city || 'Multiple Locations'}
                                </div>
                                {provider.website && (
                                  <a 
                                    href={provider.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-teal-600 hover:underline"
                                  >
                                    Visit Website →
                                  </a>
                                )}
                              </div>
                            ))}
                            {(service.name === "Hospital Services" ? hospitals : services.filter((s: any) => s.serviceCategory === service.category)).length > 5 && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => setLocation('/search')}
                                className="w-full text-xs"
                              >
                                See all {service.providerCount.toLocaleString()} providers →
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Healthcare Providers - Real Links Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Healthcare Providers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Click to explore detailed information about top healthcare systems
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mayo Clinic Card with Real Link */}
            <Link href="/providers/mayo-clinic">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-5"></div>
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-500 text-white">TOP RANKED</Badge>
                  <CardTitle className="text-xl">Mayo Clinic</CardTitle>
                  <CardDescription>World-renowned medical care</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Rochester, Phoenix, Jacksonville</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>507-284-2511</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>5.0 Rating • 4,500+ Physicians</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="default">
                    View Full Profile →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Cleveland Clinic Card with Real Link */}
            <Link href="/providers/cleveland-clinic">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-green-400">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-5"></div>
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-green-500 text-white">HEART LEADER</Badge>
                  <CardTitle className="text-xl">Cleveland Clinic</CardTitle>
                  <CardDescription>World-class healthcare innovation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Cleveland, Weston, Las Vegas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>216-444-2200</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>5.0 Rating • #2 US Hospital</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="default">
                    View Full Profile →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Johns Hopkins Card - Coming Soon */}
            <Card className="h-full opacity-75 border-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5"></div>
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">COMING SOON</Badge>
                <CardTitle className="text-xl">Johns Hopkins Medicine</CardTitle>
                <CardDescription>Leading medical research center</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Baltimore, Washington DC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>410-955-5000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>5.0 Rating • Research Pioneer</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Profile Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Hospitals Carousel */}
      <section className="px-4 py-12 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured CMS-Rated Hospitals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Top-rated medical centers in your area
            </p>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              <HospitalCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Buttons */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border-2 border-blue-200 dark:border-blue-600">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                Quick Access Tools
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/emergency-contacts')}
                >
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <span className="text-xs">Emergency</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/tours')}
                >
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <span className="text-xs">Schedule Tour</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/care-guide')}
                >
                  <Brain className="h-6 w-6 text-purple-500" />
                  <span className="text-xs">Care Guide</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setLocation('/ai-support')}
                >
                  <HeartHandshake className="h-6 w-6 text-green-500" />
                  <span className="text-xs">AI Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Finding the Right Care?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our AI-powered matching system can help you find the perfect healthcare providers
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-xl"
              onClick={() => setLocation('/ai-matching-assistant')}
            >
              <Brain className="mr-2 h-5 w-5" />
              Get Personalized Matches
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/20"
              onClick={() => setLocation('/contact')}
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}