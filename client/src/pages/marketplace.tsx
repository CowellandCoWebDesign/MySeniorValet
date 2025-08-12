import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { NavigationHeader } from "@/components/NavigationHeader";
import HospitalCarousel from "@/components/HospitalCarousel";
import { CareServiceCard } from "@/components/CareServiceCard";
import { 
  Stethoscope, Home, Activity, Users, Heart, ShoppingBasket, Utensils, Car, Shield, Monitor,
  Brain, GraduationCap, Phone, DollarSign, CheckCircle, ChevronRight, Layers, Users2, Pill,
  ShoppingCart, MapPin, Star, Clock, Calendar, Building2, Package, Truck, AlertCircle,
  Wrench, Sparkles, Flower2, ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Fetch care services data
  const { data: careServicesData } = useQuery({
    queryKey: ['/api/care-services/analytics'],
  });

  const { data: careServicesAnalytics } = useQuery({
    queryKey: ['/api/care-services/analytics/summary'],
  });

  const { data: marketplaceVendors } = useQuery({
    queryKey: ['/api/marketplace/vendors'],
  });

  const services = (careServicesData as any)?.services || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            MySeniorValet Marketplace
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Your comprehensive directory for healthcare services, care providers, and senior living resources
          </p>
        </div>
      </section>

      {/* Healthcare and Care Services Directory */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Card className="group bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white text-sm font-semibold mb-4 shadow-lg">
                    <span className="mr-2">🚀</span>
                    Now Available!
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Healthcare and Care Services Directory</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-4">
                    Connect with {(careServicesAnalytics as any)?.totalServices?.toLocaleString() || '4,210'}+ verified healthcare and caregiving services in your area
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Services Grid - 3x4 Layout */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 max-w-4xl mx-auto">
            <Link href="/hospitals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 relative overflow-hidden h-full">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1.5" />
                  <h4 className="font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-300 line-clamp-2">Hospital Services</h4>
                  <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5 line-clamp-2">6,000+ CMS verified</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">CMS RATED</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/home-care">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 relative overflow-hidden h-full">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <Home className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1.5" />
                  <h4 className="font-semibold text-xs sm:text-sm text-green-700 dark:text-green-300 line-clamp-2">Home Care Services</h4>
                  <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-0.5 line-clamp-2">Licensed caregivers</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">24/7</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            {/* Therapy Services */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm text-purple-700 dark:text-purple-300 line-clamp-2">Therapy Services</h4>
                <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 mt-0.5 line-clamp-2">
                  {services.filter((s: any) => s.serviceCategory === 'Therapy Services').length} providers
                </p>
                <div className="flex flex-col gap-0.5 mt-1">
                  <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                  <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5">PT/OT/SPEECH</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Adult Day Care */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 relative overflow-hidden h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm text-teal-700 dark:text-teal-300 line-clamp-2">Adult Day Programs</h4>
                <p className="text-[10px] sm:text-xs text-teal-600 dark:text-teal-400 mt-0.5 line-clamp-2">
                  {services.filter((s: any) => s.serviceCategory === 'Adult Day Care').length} programs
                </p>
                <div className="flex flex-col gap-0.5 mt-1">
                  <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                  <Badge className="bg-teal-500 text-white text-[10px] px-1.5 py-0.5">MEALS + TRANSPORT</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Personal Care Services */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 relative overflow-hidden h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Users2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm text-orange-700 dark:text-orange-300 line-clamp-2">Personal Care</h4>
                <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 mt-0.5 line-clamp-2">
                  {services.filter((s: any) => s.serviceCategory === 'Personal Care Services').length} providers
                </p>
                <div className="flex flex-col gap-0.5 mt-1">
                  <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">✓ VERIFIED</Badge>
                  <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5">DAILY LIVING</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Telemedicine</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Virtual consultations</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Pharmacy Services</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Medication delivery</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Medical Transport</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Wheelchair accessible</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Mental Health</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Counseling & therapy</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 h-full">
              <CardContent className="p-2 sm:p-3 text-center">
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-1.5" />
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-2">Medical Equipment</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">Mobility aids & devices</p>
                <Badge className="bg-gray-400 text-white text-[10px] px-1.5 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hospital Directory Section */}
      <section className="px-4 py-8 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">US Hospital Directory</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Comprehensive hospital information with CMS ratings</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">6,000+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Hospitals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">CMS</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Carousel */}
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <HospitalCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Marketplace Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-2 gradient-text-blue">Senior Vendor Marketplace</h3>
            <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
              Trusted vendors and services for senior living needs
            </p>
          </div>

          {/* Vendor Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/moving-services">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4 text-center">
                  <Truck className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Moving Services</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Senior-specialized movers</p>
                  <Badge className="mt-2 bg-blue-500 text-white">23 Vendors</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/floral-services">
              <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-700">
                <CardContent className="p-4 text-center">
                  <Flower2 className="w-10 h-10 text-pink-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Floral Services</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Delivery & arrangements</p>
                  <Badge className="mt-2 bg-pink-500 text-white">15 Vendors</Badge>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
              <CardContent className="p-4 text-center">
                <Wrench className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Home Maintenance</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Repairs & modifications</p>
                <Badge className="mt-2 bg-green-500 text-white">18 Vendors</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-2 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Cleaning Services</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Deep cleaning specialists</p>
                <Badge className="mt-2 bg-purple-500 text-white">12 Vendors</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-700">
              <CardContent className="p-4 text-center">
                <Package className="w-10 h-10 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Storage Solutions</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Downsizing & storage</p>
                <Badge className="mt-2 bg-orange-500 text-white">8 Vendors</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-700">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Medical Supplies</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Equipment & aids</p>
                <Badge className="mt-2 bg-teal-500 text-white">20 Vendors</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-700">
              <CardContent className="p-4 text-center">
                <Car className="w-10 h-10 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Transportation</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Medical & daily transport</p>
                <Badge className="mt-2 bg-red-500 text-white">16 Vendors</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-700">
              <CardContent className="p-4 text-center">
                <Building2 className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Real Estate</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Senior specialists</p>
                <Badge className="mt-2 bg-indigo-500 text-white">10 Vendors</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Link href="/vendor-marketplace">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Browse All Vendors
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}