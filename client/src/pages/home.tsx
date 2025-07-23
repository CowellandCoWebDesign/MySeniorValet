
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { PremiumImage } from "@/components/premium-image";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, MapPin, Database, Tag, Map, Check, Star, DollarSign, Clock, Users, Wifi, Car, Activity, MapIcon, Building, Heart, Eye, Truck, Sofa, Pill, Phone, Info, MessageCircle, Link2 } from "lucide-react";
import { Link } from "wouter";
import { GreetingMascot } from "@/components/mascot";
import { Badge } from "@/components/ui/badge";
import { EnhancedPlatformStats } from "@/components/EnhancedPlatformStats";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section - Enhanced for Senior Accessibility */}
        <section className="relative py-16 lg:py-24 overflow-hidden min-h-[90vh] flex items-center justify-center">
          {/* Hero Background Image */}
          <div className="absolute inset-0">
            <PremiumImage 
              type="hero"
              query="senior living community elderly care garden outdoor activities families"
              orientation="landscape"
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
              alt="Welcoming senior living community with diverse residents, families, and caregivers in a beautiful outdoor setting"
              fallback="/hero-senior-community.svg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/70 to-white/50 dark:from-slate-900/85 dark:via-slate-900/70 dark:to-slate-900/50"></div>
          </div>

          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 lg:mb-16">
              {/* Enhanced Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-green-200/60">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-800">31,023+ Verified Communities</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-blue-200/60">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Government Data Sources</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-purple-200/60">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">100% Transparent Pricing</span>
                </div>
              </div>

              {/* Enhanced Headlines */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                Senior Living{" "}
                <span className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Complete Care
                </span>{" "}
                &{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  Transparency
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl xl:text-3xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-6 leading-relaxed font-medium">
                Research with <strong className="text-blue-700 dark:text-blue-400">real pricing and availability</strong>, then get complete post-move services including bill payment and account management.
              </p>
              
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                We help communities become tech-professional with unified resident onboarding systems.
              </p>

              {/* Enhanced Service Pills */}
              <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-10">
                <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-blue-200/60 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-2 bg-blue-100 rounded-full relative z-10">
                    <Eye className="text-blue-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-blue-800 relative z-10">Live Pricing & Availability</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-green-200/60 hover:shadow-xl transition-all duration-300 group">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Truck className="text-green-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-green-800">Move Coordination</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-purple-200/60 hover:shadow-xl transition-all duration-300">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Sofa className="text-purple-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-purple-800">Furniture & Medical Equipment</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-amber-200/60 hover:shadow-xl transition-all duration-300">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Users className="text-amber-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-amber-800">Family Collaboration</span>
                </div>
              </div>
            </div>

            {/* Community Count Statement */}
            <div className="text-center mb-8">
              <p className="text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 font-medium mb-4">
                Serving families across <span className="text-blue-600 dark:text-blue-400 font-bold">31,023+ communities</span>
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Complete North American coverage with verified government data across 96 states/provinces
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md">
                  <span className="text-sm font-semibold text-blue-800">1,664 Counties</span>
                </div>
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md">
                  <span className="text-sm font-semibold text-green-800">4,698 Cities</span>
                </div>
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-md">
                  <span className="text-sm font-semibold text-purple-800">735,112 Total Capacity</span>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <SearchBar />

              {/* Quick Search Actions */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Link href="/search?careType=Memory%20Care">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-md border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300">
                    <span className="mr-2">🧠</span>
                    Memory Care
                  </Button>
                </Link>
                <Link href="/search?careType=Assisted%20Living">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-md border-green-200 text-green-700 hover:bg-green-50 transition-all duration-300">
                    <span className="mr-2">🤝</span>
                    Assisted Living
                  </Button>
                </Link>
                <Link href="/search?careType=Independent%20Living">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-md border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300">
                    <span className="mr-2">🏠</span>
                    Independent Living
                  </Button>
                </Link>
                <Link href="/search?priceRange=affordable">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-md border-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-300">
                    <span className="mr-2">💰</span>
                    Affordable Options
                  </Button>
                </Link>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="max-w-2xl mx-auto mb-8 space-y-4">
              <Link href="/map-search">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-4"
                >
                  <MapIcon className="mr-3 h-6 w-6" />
                  Explore All Communities on Interactive Map
                </Button>
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/quiz">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 text-lg py-4"
                  >
                    <span className="mr-2">✨</span>
                    Find My Perfect Match
                  </Button>
                </Link>
                
                <Link href="/community-portal">
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="w-full border-2 border-purple-300/50 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 text-lg py-4"
                  >
                    <Building className="mr-2 h-5 w-5" />
                    For Communities
                  </Button>
                </Link>
              </div>
            </div>

            {/* Data Integrity Promise */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-md border border-blue-200/60 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <Shield className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">100% Authentic Data Promise</h3>
                    <p className="text-blue-800 dark:text-blue-200 mb-4 leading-relaxed">
                      Every community listing is verified through official government databases including HUD properties, 
                      state licensing records, and CMS Medicare certifications. Photos are clearly labeled as authentic 
                      community images or representative images until communities claim their listings.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        ✓ Government Verified
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                        ✓ Real Pricing Data
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                        ✓ Licensed Facilities Only
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                        ✓ Photo Source Transparency
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Complete Concierge Services Section */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
                Complete Concierge Services
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything you need for senior living decisions and transitions, all in one place
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Live Pricing & Availability */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Live Pricing & Availability</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Real-time pricing and unit availability across all 31,023+ communities with government-verified data
                  </p>
                </CardContent>
              </Card>

              {/* Move Coordination */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Move Coordination</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Professional moving services, timeline coordination, and logistics management for stress-free transitions
                  </p>
                </CardContent>
              </Card>

              {/* Medical Equipment & Furniture */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sofa className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Medical Equipment & Furniture</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Medical equipment sourcing, furniture delivery, and room setup services for immediate comfort
                  </p>
                </CardContent>
              </Card>

              {/* Family Collaboration */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-400">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Family Collaboration & Tours</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Family sharing tools, tour scheduling, and progress tracking to keep everyone informed
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* All-in-One Planner CTA */}
            <div className="text-center mt-12">
              <Link href="/all-in-one-planner">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl font-semibold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="mr-3">🎯</span>
                  Start Your All-in-One Senior Living Planner
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
                Trusted by Families Nationwide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-3">31,023</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Verified Communities</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-green-600 dark:text-green-400 mb-3">101</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">States & Provinces</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-3">633K</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Total Housing Units</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-3">100%</div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Transparent Pricing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligent Pricing System Showcase */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-6 shadow-lg">
                    <DollarSign className="text-white h-8 w-8" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                    Intelligent Pricing System
                  </h2>
                </div>
                
                <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                  Our AI-powered pricing intelligence combines government data, HUD records, and real market analysis to provide accurate cost estimates for all 31,023+ communities.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-lg font-bold">🏛️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Government Data Integration</h3>
                      <p className="text-gray-700 dark:text-gray-300">HUD housing data, CMS Medicare records, and state licensing information from all 96 covered regions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-lg font-bold">📊</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Real Market Analysis</h3>
                      <p className="text-gray-700 dark:text-gray-300">Regional cost-of-living data and demographic analysis for accurate estimates nationwide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-lg font-bold">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Care Level Matching</h3>
                      <p className="text-gray-700 dark:text-gray-300">Pricing adjusted based on specific care needs and service levels across all facility types</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <Link href="/real-data-pricing">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <Database className="mr-3 h-6 w-6" />
                      Explore Pricing Intelligence
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="lg:text-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Sample Pricing Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <span className="font-medium">Assisted Living (Bay Area)</span>
                      <span className="text-xl font-bold text-green-600">$5,200-$7,800</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <span className="font-medium">Memory Care (Sacramento)</span>
                      <span className="text-xl font-bold text-blue-600">$6,500-$9,200</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <span className="font-medium">HUD Senior Housing</span>
                      <span className="text-xl font-bold text-purple-600">$303-$375</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <span className="font-medium">Independent Living</span>
                      <span className="text-xl font-bold text-orange-600">$2,800-$4,500</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Prices based on government data and real market analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Family Collaboration Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-4">
                  <Users className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Keep Your Family In The Loop
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Finding the right senior living community is a family decision. Share discoveries instantly with one click.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* One-Click Sharing */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
                      <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">One-Click Family Sharing</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Send detailed community information, photos, and pricing to multiple family members instantly.
                      </p>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Works with email, text, WhatsApp, and more
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Formatting */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
                      <Info className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Smart Information Formatting</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Automatically formats community details, pricing, care types, and reviews for easy sharing.
                      </p>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Professional email templates included
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tour Tracker */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3">
                      <MapPin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Family Tour Tracker</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        One tour for all family members. Track visit notes, photos, and impressions that everyone can see.
                      </p>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Shared tour insights and findings
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/family-collaboration">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Users className="mr-3 h-6 w-6" />
                  Learn More About Family Collaboration
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Family CTA */}
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-3xl overflow-hidden shadow-2xl mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-10 lg:p-12 text-white">
                  <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 leading-tight">
                    Ready to Find the Perfect Community?
                  </h2>
                  <p className="text-xl lg:text-2xl mb-8 text-green-100 leading-relaxed">
                    Start with our transparent search across 31,023+ communities with real pricing, verified licensing, and authentic reviews.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-green-600 h-5 w-5" />
                      </div>
                      <span className="text-xl">See real pricing before you call</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-green-600 h-5 w-5" />
                      </div>
                      <span className="text-xl">Compare communities side-by-side</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-green-600 h-5 w-5" />
                      </div>
                      <span className="text-xl">Share with family instantly</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/search">
                      <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xl px-10 py-4">
                        <MapPin className="mr-3 h-6 w-6" />
                        Start Your Search
                      </Button>
                    </Link>
                    <Link href="/quiz">
                      <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-10 py-4 text-xl">
                        Take Matching Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block relative overflow-hidden">
                  <PremiumImage 
                    type="hero"
                    query="happy senior couple reviewing community options together family"
                    orientation="portrait"
                    className="w-full h-full object-cover"
                    width={600}
                    height={400}
                    alt="Happy senior couple reviewing community options together with family"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-green-600/20"></div>
                </div>
              </div>
            </div>

            {/* Community Owner CTA */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-10 text-white">
                  <h2 className="text-2xl lg:text-3xl font-display font-bold mb-4 leading-tight">
                    Own a Senior Living Community?
                  </h2>
                  <p className="text-lg lg:text-xl mb-6 text-blue-100 leading-relaxed">
                    Claim your community profile to ensure accurate information and showcase your transparency commitment to families.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-white h-4 w-4" />
                      </div>
                      <span>Update your community information in real-time</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-white h-4 w-4" />
                      </div>
                      <span>Respond to family inquiries directly</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-white h-4 w-4" />
                      </div>
                      <span>Showcase your compliance and transparency</span>
                    </div>
                  </div>
                  <Link href="/community-portal">
                    <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4">
                      <Building className="mr-3 h-5 w-5" />
                      Claim Your Community
                    </Button>
                  </Link>
                </div>
                <div className="hidden lg:block relative overflow-hidden">
                  <PremiumImage 
                    type="community"
                    query="senior living community staff assisting residents professional care"
                    orientation="portrait"
                    className="w-full h-full object-cover"
                    width={600}
                    height={400}
                    alt="Senior living community staff assisting residents in professional care environment"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-600/20"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Platform Statistics */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EnhancedPlatformStats />
          </div>
        </section>

        <Footer />

        {/* Greeting Mascot */}
        <GreetingMascot
          autoShow={true}
          onDismiss={() => {
            localStorage.setItem('greeting-mascot-dismissed', 'true');
          }}
        />
      </div>
    </div>
  );
}
