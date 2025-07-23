import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { PremiumImage } from "@/components/premium-image";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, MapPin, Database, Tag, Map, Check, Star, DollarSign, Clock, Users, Wifi, Car, Activity, MapIcon, Building } from "lucide-react";
import { Link } from "wouter";
import { GreetingMascot } from "@/components/mascot";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <Header />

      {/* Hero Section - Optimized for Senior Accessibility */}
      <section className="relative py-16 lg:py-24 overflow-hidden min-h-[85vh] flex items-center justify-center">
        {/* Hero Background Image - Unsplash Exemption */}
        <div className="absolute inset-0">
          <PremiumImage 
            type="hero"
            query="senior living community elderly care garden outdoor activities"
            orientation="landscape"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            alt="Welcoming senior living community with diverse residents, families, and caregivers in a beautiful setting"
            fallback="/hero-senior-community.svg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/70 to-white/50"></div>
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-16">
            {/* Trust Indicators Above Title */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-green-200/50">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-800">25,782+ Verified Communities</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-blue-200/50">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Government Data Sources</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 mb-8 leading-tight">
              Senior Living{" "}
              <span className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transparency</span> &{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">Complete Care</span>
            </h1>
            <p className="text-xl lg:text-2xl xl:text-3xl text-gray-700 max-w-4xl mx-auto mb-6 leading-relaxed font-medium">
              Research with <strong className="text-blue-700">real pricing and availability</strong>, then get complete post-move services including bill payment and account management.
            </p>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              We help communities become tech-professional with unified resident onboarding systems.
            </p>

            {/* Enhanced Feature Pills - Larger for Seniors */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-10">
                <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-md border border-blue-200/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-2 bg-blue-100 rounded-full relative z-10">
                    <DollarSign className="text-blue-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-blue-800 relative z-10">Real Transparency</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                </div>
                <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-md border border-green-200/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Users className="text-green-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-green-800">Post-Move Services</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-md border border-blue-200/50 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="text-blue-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-blue-800">Live Availability</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-md border border-purple-200/50 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Wifi className="text-purple-600 h-5 w-5" />
                  </div>
                  <span className="text-base lg:text-lg font-semibold text-purple-800">Tech-Professional Communities</span>
                </div>
            </div>
          </div>

          {/* Community Count Statement */}
          <div className="text-center mb-6">
            <p className="text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 font-medium">
              Serving families across 25,000+ communities
            </p>
          </div>

          {/* Optimized Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar />

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link href="/search?careType=Memory%20Care">
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-md border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300">
                  <span className="mr-1">🧠</span>
                  Memory Care
                </Button>
              </Link>
              <Link href="/search?careType=Assisted%20Living">
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-md border-green-200 text-green-700 hover:bg-green-50 transition-all duration-300">
                  <span className="mr-1">🤝</span>
                  Assisted Living
                </Button>
              </Link>
              <Link href="/search?careType=Independent%20Living">
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-md border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300">
                  <span className="mr-1">🏠</span>
                  Independent Living
                </Button>
              </Link>
              <Link href="/search?priceRange=affordable">
                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-md border-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-300">
                  <span className="mr-1">💰</span>
                  Affordable Options
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-2xl mx-auto mb-6 space-y-3">
            <Link href="/map-search">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <MapIcon className="mr-2 h-5 w-5" />
                Explore All Communities on Map
              </Button>
            </Link>

            {/* For Communities Button */}
            <Link href="/community-portal">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Building className="mr-2 h-5 w-5" />
                For Communities - Manage Your Profile
              </Button>
            </Link>
          </div>

          {/* Data Integrity Notice */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md border border-blue-200/60 rounded-xl p-6 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-lg lg:text-xl text-blue-900 leading-relaxed">
                  <strong className="text-blue-800 font-semibold">Trusted Data Sources:</strong> Information from Google Places, Yelp reviews, state licensing records, and verified community websites.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 lg:py-16 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Trusted by Families Nationwide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">95%</div>
                <p className="text-gray-600 dark:text-gray-300">Families find pricing more transparent than other platforms</p>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">48hrs</div>
                <p className="text-gray-600 dark:text-gray-300">Average time to schedule first community tour</p>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">31,023</div>
                <p className="text-gray-600 dark:text-gray-300">Communities with verified licensing data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Senior-Friendly Sizing */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Why MySeniorValet is Different
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We aggregate data from multiple trusted sources including Google, Yelp, state agencies, and community websites to give you the complete picture.
            </p>
          </div>

          {/* Enhanced Feature Cards - Larger Text for Seniors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="group bg-white dark:bg-gray-800 hover:bg-green-50/50 dark:hover:bg-green-900/20 border border-green-200/60 dark:border-green-700/40 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="text-green-600 dark:text-green-400 h-8 w-8" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-green-900 dark:text-green-100 mb-4">Transparent Pricing</h3>
              <p className="text-green-700 dark:text-green-300 text-base lg:text-lg leading-relaxed">
                See real monthly costs, special offers, and pricing updates. No surprises or hidden fees.
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 border border-yellow-200/60 dark:border-yellow-700/40 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-yellow-600 dark:text-yellow-400 h-8 w-8" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-4">Authentic Reviews</h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-base lg:text-lg leading-relaxed">
                Read real Google reviews and family experiences to understand what life is really like.
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/40 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-blue-600 dark:text-blue-400 h-8 w-8" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">Live Availability</h3>
              <p className="text-blue-700 dark:text-blue-300 text-base lg:text-lg leading-relaxed">
                Check real-time availability and unit counts. Know exactly what's open right now.
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 border border-purple-200/60 dark:border-purple-700/40 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="text-purple-600 dark:text-purple-400 h-8 w-8" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">Rich Amenities</h3>
              <p className="text-purple-700 dark:text-purple-300 text-base lg:text-lg leading-relaxed">
                Explore pools, fitness centers, dining options, and activities that make a difference.
              </p>
            </div>
          </div>



          {/* Intelligent Pricing Showcase */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 lg:p-12 shadow-lg border border-green-100/50 dark:border-gray-600 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                    <DollarSign className="text-white h-6 w-6" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl xl:text-4xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                    Intelligent Pricing System
                  </h3>
                </div>
                <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  Our AI-powered pricing intelligence combines government data, HUD records, and real market analysis to provide accurate cost estimates even for communities that haven't claimed their profiles.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-sm font-bold">🏛️</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Government Data Integration</h4>
                      <p className="text-gray-700 dark:text-gray-300">HUD housing data, CMS Medicare records, and state licensing information</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Market Analysis</h4>
                      <p className="text-gray-700 dark:text-gray-300">Regional cost-of-living data and demographic analysis for accurate estimates</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-sm font-bold">🎯</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Care Level Matching</h4>
                      <p className="text-gray-700 dark:text-gray-300">Pricing adjusted based on specific care needs and service levels</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/real-data-pricing">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                      <Database className="mr-2 h-5 w-5" />
                      Explore Pricing Intelligence
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="lg:text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sample Pricing Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium">Assisted Living (Bay Area)</span>
                      <span className="text-lg font-bold text-green-600">$5,200-$7,800</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium">Memory Care (Sacramento)</span>
                      <span className="text-lg font-bold text-blue-600">$6,500-$9,200</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium">HUD Senior Housing</span>
                      <span className="text-lg font-bold text-purple-600">$303-$375</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Prices based on government data and market analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Data Collection Section - Senior-Friendly */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 lg:p-12 shadow-lg border border-blue-100/50 dark:border-gray-600">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl lg:text-3xl xl:text-4xl font-display font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                  How Our Data Collection Works
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-lg font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Multi-Source Aggregation</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed">We collect data from Google Places, Yelp, state licensing databases, and official community websites.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-lg font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Verification</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed">Information is cross-referenced across multiple sources and validated before being displayed.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-lg font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-Time Updates</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed">Changes are immediately reflected in search results and community profiles for the most current information.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:text-center">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="Data visualization and analytics dashboard"
                  className="rounded-xl shadow-lg w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Family CTA */}
          <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl overflow-hidden shadow-xl mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12 text-white">
                <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 leading-tight">
                  Ready to Find the Perfect Community?
                </h2>
                <p className="text-lg lg:text-xl mb-8 text-green-100 leading-relaxed">
                  Start with our transparent search to find communities with real pricing, verified licensing, and authentic reviews.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-green-600 h-4 w-4" />
                    </div>
                    <span className="text-lg">See real pricing before you call</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-green-600 h-4 w-4" />
                    </div>
                    <span className="text-lg">Compare communities side-by-side</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-green-600 h-4 w-4" />
                    </div>
                    <span className="text-lg">Share with family instantly</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/search">
                    <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-lg px-8 py-4">
                      <MapPin className="mr-2 h-5 w-5" />
                      Start Your Search
                    </Button>
                  </Link>
                  <Link href="/quiz">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg">
                      Take Matching Quiz
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="Happy senior couple reviewing community options together"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-green-600/20"></div>
              </div>
            </div>
          </div>

          {/* Community Owner CTA */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-6 lg:p-8 text-white">
                <h2 className="text-2xl lg:text-3xl font-display font-bold mb-4 leading-tight">
                  Own a Senior Living Community?
                </h2>
                <p className="text-base lg:text-lg mb-6 text-blue-100 leading-relaxed">
                  Claim your community profile to ensure accurate information and showcase your transparency commitment to families.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-4 w-4" />
                    </div>
                    <span className="text-sm">Update your community information in real-time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-4 w-4" />
                    </div>
                    <span className="text-sm">Respond to family inquiries directly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-4 w-4" />
                    </div>
                    <span className="text-sm">Showcase your compliance and transparency</span>
                  </div>
                </div>
                <Link href="/claim">
                  <Button variant="secondary" size="default" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                    Claim Your Community
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                  alt="Senior living community staff assisting residents"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-600/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Greeting Mascot */}
      <GreetingMascot
        autoShow={true}
        onDismiss={() => {
          // Store in localStorage to prevent showing again
          localStorage.setItem('greeting-mascot-dismissed', 'true');
        }}
      />
       <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">100% Authentic Data Promise</h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
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
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}