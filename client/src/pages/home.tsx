import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { PremiumImage } from "@/components/premium-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, MapPin, Database, Tag, Map, Check, Star, DollarSign, Clock, Users, Wifi, Car, Activity, MapIcon } from "lucide-react";
import { Link } from "wouter";

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
      
      {/* Hero Section - Optimized Sizing */}
      <section className="relative py-12 lg:py-20 overflow-hidden min-h-[80vh] flex items-center">
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
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
              Find Senior Living with{" "}
              <span className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transparent Pricing</span> &{" "}
              <span className="text-green-600 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Live Availability</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Get real pricing, read authentic reviews, check live availability, and explore amenities to make confident decisions for your family.
            </p>
            
            {/* Optimized Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-8">
                <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-green-200/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="p-1 bg-green-100 rounded-full relative z-10">
                    <DollarSign className="text-green-600 h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-green-800 relative z-10">Real Pricing</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                </div>
                <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-yellow-200/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <Star className="text-yellow-500 h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-yellow-800">Trusted Reviews</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-blue-200/50 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Clock className="text-blue-600 h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-blue-800">Live Availability</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-purple-200/50 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-1 bg-purple-100 rounded-full">
                    <Activity className="text-purple-600 h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-purple-800">Rich Amenities</span>
                </div>
            </div>
          </div>

          {/* Optimized Search Bar */}
          <div className="max-w-4xl mx-auto mb-6">
            <SearchBar />
          </div>

          {/* Explore Communities Button */}
          <div className="max-w-2xl mx-auto mb-6">
            <Link href="/explore">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <MapIcon className="mr-2 h-5 w-5" />
                Explore All Communities on Map
              </Button>
            </Link>
          </div>
          
          {/* Compact Data Integrity Notice */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md border border-blue-200/60 rounded-xl p-4 shadow-md">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-900 leading-relaxed">
                  <strong className="text-blue-800 font-medium">Trusted Data Sources:</strong> Information from Google Places, Yelp reviews, state licensing records, and verified community websites.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-4 leading-tight">
              Why TrueView is Different
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We aggregate data from multiple trusted sources including Google, Yelp, state agencies, and community websites to give you the complete picture.
            </p>
          </div>
          
          {/* Compact Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group bg-white hover:bg-green-50/50 border border-green-200/60 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-green-600 h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-3">Transparent Pricing</h3>
              <p className="text-green-700 text-sm leading-relaxed">
                See real monthly costs, special offers, and pricing updates. No surprises or hidden fees.
              </p>
            </div>
            
            <div className="group bg-white hover:bg-yellow-50/50 border border-yellow-200/60 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-yellow-600 h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-yellow-900 mb-3">Authentic Reviews</h3>
              <p className="text-yellow-700 text-sm leading-relaxed">
                Read real Google reviews and family experiences to understand what life is really like.
              </p>
            </div>
            
            <div className="group bg-white hover:bg-blue-50/50 border border-blue-200/60 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600 h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-3">Live Availability</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Check real-time availability and unit counts. Know exactly what's open right now.
              </p>
            </div>
            
            <div className="group bg-white hover:bg-purple-50/50 border border-purple-200/60 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="text-purple-600 h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-purple-900 mb-3">Rich Amenities</h3>
              <p className="text-purple-700 text-sm leading-relaxed">
                Explore pools, fitness centers, dining options, and activities that make a difference.
              </p>
            </div>
          </div>

          {/* Compact Data Collection Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 lg:p-8 shadow-lg border border-blue-100/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl lg:text-2xl font-display font-bold text-gray-900 mb-6 leading-tight">
                  How Our Data Collection Works
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">Multi-Source Aggregation</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">We collect data from Google Places, Yelp, state licensing databases, and official community websites.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">Data Verification</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">Information is cross-referenced across multiple sources and validated before being displayed.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mt-1 shadow-md">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">Real-Time Updates</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">Changes are immediately reflected in search results and community profiles for the most current information.</p>
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

      {/* Compact CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
}
