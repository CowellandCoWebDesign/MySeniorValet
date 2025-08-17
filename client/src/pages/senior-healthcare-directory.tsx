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
  ChevronDown, ChevronUp, ChevronRight, CheckCircle, MapPin, Clock, Phone, Star,
  Zap, HeartHandshake, UserCheck, Calendar, AlertCircle,
  Users2, Car, ShoppingCart, Layers, ExternalLink
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

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
  expanded?: boolean;
}

export default function SeniorHealthcareDirectory() {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true, // Hospital Services expanded by default
    2: true, // Home Care expanded by default
  });
  
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

  // Fetch featured hospitals for slider
  const { data: featuredHospitals, isLoading: featuredHospitalsLoading } = useQuery({
    queryKey: ['/api/hospitals/featured'],
  });

  const services = (careServicesData as any)?.services || [];
  const hospitals = (hospitalsData as any)?.hospitals || [];
  const featuredHospitalsList = (featuredHospitals as any)?.hospitals || [];

  const toggleSection = (id: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
      providerCount: services.filter((s: any) => s.serviceCategory === 'Therapy Services').length || 144,
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
      name: "Memory Care",
      category: "Dementia Support",
      description: "Specialized dementia and Alzheimer's care",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Memory Care').length || 200,
      verified: true,
      icon: Brain,
      link: "/memory-care",
      color: "from-orange-500 to-red-500",
      badge: "SPECIALIZED"
    },
    {
      id: 6,
      name: "Hospice Care",
      category: "End-of-Life Care",
      description: "Compassionate end-of-life support",
      providerCount: services.filter((s: any) => s.serviceCategory === 'Hospice Care').length || 150,
      verified: true,
      icon: Heart,
      link: "/hospice-care",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  // Mock data for provider carousels
  const providersByCategory: Record<string, any[]> = {
    "Hospital Services": featuredHospitalsList.length > 0 ? featuredHospitalsList : [
      { id: 1, name: "Cleveland Clinic", rating: 4.8, city: "Cleveland", state: "OH", verified: true },
      { id: 2, name: "Mayo Clinic", rating: 4.9, city: "Rochester", state: "MN", verified: true },
      { id: 3, name: "Johns Hopkins Hospital", rating: 4.7, city: "Baltimore", state: "MD", verified: true },
      { id: 4, name: "UCLA Medical Center", rating: 4.6, city: "Los Angeles", state: "CA", verified: true },
    ],
    "Home Care Services": services.filter((s: any) => s.serviceCategory === 'Home Care').slice(0, 4).length > 0 
      ? services.filter((s: any) => s.serviceCategory === 'Home Care').slice(0, 4)
      : [
        { id: 1, name: "Comfort Keepers", rating: 4.5, city: "National", state: "Coverage", verified: true },
        { id: 2, name: "Visiting Angels", rating: 4.6, city: "National", state: "Coverage", verified: true },
        { id: 3, name: "Home Instead", rating: 4.4, city: "National", state: "Coverage", verified: true },
        { id: 4, name: "Right at Home", rating: 4.3, city: "National", state: "Coverage", verified: true },
      ],
    "Therapy Services": services.filter((s: any) => s.serviceCategory === 'Therapy Services').slice(0, 4).length > 0
      ? services.filter((s: any) => s.serviceCategory === 'Therapy Services').slice(0, 4)
      : [
        { id: 1, name: "BenchMark Physical Therapy", rating: 4.6, city: "Multiple", state: "Locations", verified: true },
        { id: 2, name: "ATI Physical Therapy", rating: 4.5, city: "National", state: "Network", verified: true },
        { id: 3, name: "Select Physical Therapy", rating: 4.4, city: "Multiple", state: "States", verified: true },
      ],
    "Memory Care": [
      { id: 1, name: "Sunrise Senior Living", rating: 4.3, city: "National", state: "Chain", verified: true },
      { id: 2, name: "Brookdale Memory Care", rating: 4.2, city: "National", state: "Chain", verified: true },
      { id: 3, name: "Silverado Memory Care", rating: 4.5, city: "Multiple", state: "States", verified: true },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Senior Healthcare Directory
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive healthcare services for seniors - from hospitals to home care
          </p>
        </div>

        {/* Healthcare Services Grid */}
        <div className="space-y-6">
          {healthcareServices.map((service) => {
            const isExpanded = expandedSections[service.id];
            const providers = providersByCategory[service.name] || [];
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: service.id * 0.05 }}
                className="border border-border rounded-lg overflow-hidden bg-gradient-to-br from-card/50 to-card"
              >
                {/* Service Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                        <service.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">{service.name}</h3>
                          {service.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {service.badge}
                            </Badge>
                          )}
                          {service.verified && (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              VERIFIED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.category}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="font-medium">{service.description}</span>
                          <span className="text-muted-foreground">
                            {service.providerCount.toLocaleString()} providers
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={service.link}>
                        <Button variant="outline" size="sm" className="gap-2">
                          View All
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(service.id)}
                        className="gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Hide
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expandable Content with Provider Carousel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border"
                    >
                      <div className="p-6 pt-4">
                        {/* Provider Cards Carousel */}
                        {providers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {providers.map((provider) => (
                              <Card key={provider.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-sm line-clamp-2">
                                      {provider.name || provider.serviceName}
                                    </h4>
                                    {provider.verified && (
                                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="space-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{provider.city}, {provider.state}</span>
                                    </div>
                                    {provider.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{provider.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full mt-3 text-xs"
                                    onClick={() => setLocation(`/${service.link}/${provider.id}`)}
                                  >
                                    View Details
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Loading providers...</p>
                          </div>
                        )}
                        
                        {/* Quick Stats */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-secondary/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {service.providerCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Providers</div>
                          </div>
                          <div className="text-center p-3 bg-secondary/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">
                              98%
                            </div>
                            <div className="text-xs text-muted-foreground">Verified</div>
                          </div>
                          <div className="text-center p-3 bg-secondary/50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-500">
                              50
                            </div>
                            <div className="text-xs text-muted-foreground">States Covered</div>
                          </div>
                          <div className="text-center p-3 bg-secondary/50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-500">
                              24/7
                            </div>
                            <div className="text-xs text-muted-foreground">Availability</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Resources Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg border border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Healthcare Resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Medicare Resources</h3>
                <p className="text-sm text-muted-foreground">Find Medicare-approved providers and coverage information</p>
                <Link href="/medicare-resources">
                  <Button variant="link" className="px-0 mt-2">
                    Learn More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <AlertCircle className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-semibold mb-1">Emergency Services</h3>
                <p className="text-sm text-muted-foreground">24/7 emergency healthcare contacts and crisis support</p>
                <Link href="/emergency-services">
                  <Button variant="link" className="px-0 mt-2">
                    View Contacts <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <Monitor className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold mb-1">Telehealth Options</h3>
                <p className="text-sm text-muted-foreground">Virtual healthcare services for remote consultations</p>
                <Link href="/telehealth">
                  <Button variant="link" className="px-0 mt-2">
                    Explore Options <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}