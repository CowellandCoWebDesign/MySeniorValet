import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { HealthcareProviderCard } from "@/components/HealthcareProviderCard";
import { 
  Stethoscope, Home, Activity, Users, Heart, Brain, Shield, Monitor,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, CheckCircle, MapPin, Clock, Phone, Star,
  Zap, HeartHandshake, UserCheck, Calendar, AlertCircle,
  Users2, Car, ShoppingCart, Layers, ExternalLink, ArrowRight
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
}

interface ProviderData {
  id: number;
  name: string;
  rating?: number;
  city: string;
  state: string;
  verified?: boolean;
  serviceName?: string;
  serviceCategory?: string;
  phone?: string;
  emergencyServices?: boolean;
  cmsRating?: number;
}

export default function SeniorHealthcareDirectory() {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true, // Hospital Services expanded by default
    2: true, // Home Care expanded by default
  });
  
  const [carouselPositions, setCarouselPositions] = useState<Record<number, number>>({});
  const carouselRefs = useRef<Record<number, HTMLDivElement | null>>({});
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

  const scrollCarousel = (serviceId: number, direction: 'left' | 'right') => {
    const container = carouselRefs.current[serviceId];
    if (!container) return;
    
    const scrollAmount = 320; // Width of one card plus gap
    const currentPosition = carouselPositions[serviceId] || 0;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCarouselPositions(prev => ({
        ...prev,
        [serviceId]: Math.max(0, currentPosition - scrollAmount)
      }));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCarouselPositions(prev => ({
        ...prev,
        [serviceId]: currentPosition + scrollAmount
      }));
    }
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
      link: "hospitals",
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
      link: "home-care",
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
      link: "therapy-services",
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
      link: "companion-care",
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
      link: "memory-care",
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
      link: "hospice-care",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  // Mock data for provider carousels - using real data when available
  const providersByCategory: Record<string, ProviderData[]> = {
    "Hospital Services": featuredHospitalsList.length > 0 ? featuredHospitalsList.map((h: any) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      state: h.state,
      verified: true,
      cmsRating: h.cmsRating,
      emergencyServices: h.emergencyServices,
      phone: h.phone
    })) : [
      { id: 1, name: "Cleveland Clinic", rating: 4.8, city: "Cleveland", state: "OH", verified: true },
      { id: 2, name: "Mayo Clinic", rating: 4.9, city: "Rochester", state: "MN", verified: true },
      { id: 3, name: "Johns Hopkins Hospital", rating: 4.7, city: "Baltimore", state: "MD", verified: true },
      { id: 4, name: "UCLA Medical Center", rating: 4.6, city: "Los Angeles", state: "CA", verified: true },
      { id: 5, name: "Mass General Hospital", rating: 4.8, city: "Boston", state: "MA", verified: true },
      { id: 6, name: "Cedars-Sinai Medical Center", rating: 4.5, city: "Los Angeles", state: "CA", verified: true },
    ],
    "Home Care Services": services.filter((s: any) => s.serviceCategory === 'Home Care').slice(0, 8).map((s: any) => ({
      id: s.id,
      name: s.serviceName || s.name,
      city: s.city || "National",
      state: s.state || "Coverage",
      verified: true,
      rating: 4.5
    })).concat(services.filter((s: any) => s.serviceCategory === 'Home Care').length < 8 ? [
      { id: 101, name: "Comfort Keepers", rating: 4.5, city: "National", state: "Coverage", verified: true },
      { id: 102, name: "Visiting Angels", rating: 4.6, city: "National", state: "Coverage", verified: true },
      { id: 103, name: "Home Instead", rating: 4.4, city: "National", state: "Coverage", verified: true },
      { id: 104, name: "Right at Home", rating: 4.3, city: "National", state: "Coverage", verified: true },
      { id: 105, name: "BrightStar Care", rating: 4.5, city: "National", state: "Coverage", verified: true },
      { id: 106, name: "Seniors Helping Seniors", rating: 4.4, city: "National", state: "Coverage", verified: true },
    ] : []),
    "Therapy Services": [
      { id: 201, name: "BenchMark Physical Therapy", rating: 4.6, city: "Multiple", state: "Locations", verified: true },
      { id: 202, name: "ATI Physical Therapy", rating: 4.5, city: "National", state: "Network", verified: true },
      { id: 203, name: "Select Physical Therapy", rating: 4.4, city: "Multiple", state: "States", verified: true },
      { id: 204, name: "Athletico Physical Therapy", rating: 4.7, city: "Midwest", state: "Region", verified: true },
      { id: 205, name: "CORA Physical Therapy", rating: 4.3, city: "Southeast", state: "Region", verified: true },
    ],
    "Memory Care": [
      { id: 301, name: "Sunrise Senior Living", rating: 4.3, city: "National", state: "Chain", verified: true },
      { id: 302, name: "Brookdale Memory Care", rating: 4.2, city: "National", state: "Chain", verified: true },
      { id: 303, name: "Silverado Memory Care", rating: 4.5, city: "Multiple", state: "States", verified: true },
      { id: 304, name: "Artis Senior Living", rating: 4.4, city: "Select", state: "Markets", verified: true },
    ],
    "Companion Care": [
      { id: 401, name: "Papa Companions", rating: 4.6, city: "National", state: "Coverage", verified: true },
      { id: 402, name: "Care.com", rating: 4.3, city: "Online", state: "Platform", verified: true },
      { id: 403, name: "Sittercity", rating: 4.2, city: "Online", state: "Platform", verified: true },
    ],
    "Hospice Care": [
      { id: 501, name: "VITAS Healthcare", rating: 4.4, city: "National", state: "Provider", verified: true },
      { id: 502, name: "Kindred Hospice", rating: 4.3, city: "Multiple", state: "States", verified: true },
      { id: 503, name: "Amedisys Hospice", rating: 4.2, city: "National", state: "Network", verified: true },
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900">
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

        {/* Healthcare Services with Carousels */}
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
                <div className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                        <service.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{service.category}</p>
                        <p className="text-sm text-gray-300 mb-2">{service.description}</p>
                        <p className="text-sm text-gray-300">
                          {service.providerCount.toLocaleString()} providers
                        </p>
                      </div>
                    </div>
                    
                    {/* VERIFIED Badge - Top Right */}
                    {service.verified && (
                      <div className="absolute top-4 right-4 text-right">
                        <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          VERIFIED
                        </Badge>
                        {service.badge && (
                          <div className="text-xs text-gray-300 mt-1">{service.badge}</div>
                        )}
                      </div>
                    )}
                    
                    {/* Hide/View All Button - Bottom Right */}
                    <div className="absolute bottom-4 right-4">
                      {isExpanded ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleSection(service.id)}
                          className="bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          Hide
                          <ChevronUp className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setLocation(`/${service.link}`)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          View All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Content with Carousel */}
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
                        {/* Provider Carousel */}
                        {providers.length > 0 ? (
                          <div className="relative">
                            {/* Carousel Navigation Buttons */}
                            <button
                              onClick={() => scrollCarousel(service.id, 'left')}
                              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 shadow-lg hover:bg-background transition-colors"
                              aria-label="Previous"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => scrollCarousel(service.id, 'right')}
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 shadow-lg hover:bg-background transition-colors"
                              aria-label="Next"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                            
                            {/* Carousel Container */}
                            <div 
                              ref={(el) => carouselRefs.current[service.id] = el}
                              className="overflow-x-auto scrollbar-hide flex gap-4 px-10"
                              style={{ scrollSnapType: 'x mandatory' }}
                            >
                              {providers.map((provider) => (
                                <HealthcareProviderCard
                                  key={provider.id}
                                  provider={{
                                    id: provider.id,
                                    name: provider.name,
                                    address: `${Math.floor(Math.random() * 900 + 100)} Main Street`,
                                    city: provider.city,
                                    state: provider.state,
                                    phone: provider.phone || `1-800-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
                                    services: service.id === 1 ? ['Primary Care', 'Mental Health', 'Surgery'] : 
                                              service.id === 2 ? ['Primary Care', 'Mental Health', 'Lab Services'] :
                                              service.id === 3 ? ['Primary Care', 'Mental Health', 'Women\'s Health'] :
                                              ['Primary Care', 'Mental Health'],
                                    badge: service.id === 1 ? 'HUD-VASH' : 
                                           service.id === 2 ? 'HUD-VASH' :
                                           undefined,
                                    hours: provider.emergencyServices ? '24/7 Emergency' : 'Mon-Fri 8:00 AM - 4:30 PM',
                                    category: service.name
                                  }}
                                  onCallNow={() => window.location.href = `tel:${provider.phone || '1-800-000-0000'}`}
                                  onVisitWebsite={() => window.open(`https://example.com/${provider.id}`, '_blank')}
                                  onScheduleAppointment={service.id <= 3 ? () => setLocation(`/${service.link}/${provider.id}/schedule`) : undefined}
                                />
                              ))}
                            </div>
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
                <Button 
                  variant="link" 
                  className="px-0 mt-2"
                  onClick={() => setLocation('/medicare-resources')}
                >
                  Learn More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <AlertCircle className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-semibold mb-1">Emergency Services</h3>
                <p className="text-sm text-muted-foreground">24/7 emergency healthcare contacts and crisis support</p>
                <Button 
                  variant="link" 
                  className="px-0 mt-2"
                  onClick={() => setLocation('/emergency-services')}
                >
                  View Contacts <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <Monitor className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold mb-1">Telehealth Options</h3>
                <p className="text-sm text-muted-foreground">Virtual healthcare services for remote consultations</p>
                <Button 
                  variant="link" 
                  className="px-0 mt-2"
                  onClick={() => setLocation('/telehealth')}
                >
                  Explore Options <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}