import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, MapPin, Database, Tag, Map, Check, Star, DollarSign, Clock, Users, Wifi, Car, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200"
            alt="Happy seniors enjoying activities at a senior living community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70"></div>
        </div>
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-gray-900 mb-8 leading-tight">
              Find Senior Living with{" "}
              <span className="text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transparent Pricing</span> &{" "}
              <span className="text-green-600 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Live Availability</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
              Get real pricing, read authentic reviews, check live availability, and explore amenities to make confident decisions for your family.
            </p>
            
            {/* Enhanced Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-12">
              <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-green-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="text-green-600 h-6 w-6" />
                </div>
                <span className="text-base font-bold text-green-800">Real Pricing</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-yellow-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="text-yellow-500 h-6 w-6" />
                </div>
                <span className="text-base font-bold text-yellow-800">Trusted Reviews</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-blue-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="text-blue-600 h-6 w-6" />
                </div>
                <span className="text-base font-bold text-blue-800">Live Availability</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg border border-purple-200/50 hover:shadow-xl transition-shadow duration-300">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Activity className="text-purple-600 h-6 w-6" />
                </div>
                <span className="text-base font-bold text-purple-800">Rich Amenities</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-5xl mx-auto mb-8">
            <SearchBar />
          </div>
          
          {/* Enhanced Data Integrity Notice */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md border border-blue-200/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-base text-blue-900 leading-relaxed">
                  <strong className="text-blue-800 font-semibold">Trusted Data Sources:</strong> Information aggregated from Google Places, Yelp reviews, state licensing records, business registrations, and verified community websites. Real photos, authentic reviews, and up-to-date availability.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">
              Why TrueView is Different
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We aggregate data from multiple trusted sources including Google, Yelp, state agencies, and community websites to give you the complete picture.
            </p>
          </div>
          
          {/* KEY FEATURES - Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="group bg-white hover:bg-green-50/50 border border-green-200/60 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="text-green-600 h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">Transparent Pricing</h3>
              <p className="text-green-700 text-base leading-relaxed">
                See real monthly costs, special offers, and pricing updates. No surprises or hidden fees.
              </p>
            </div>
            
            <div className="group bg-white hover:bg-yellow-50/50 border border-yellow-200/60 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="text-yellow-600 h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-4">Authentic Reviews</h3>
              <p className="text-yellow-700 text-base leading-relaxed">
                Read real Google reviews and family experiences to understand what life is really like.
              </p>
            </div>
            
            <div className="group bg-white hover:bg-blue-50/50 border border-blue-200/60 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="text-blue-600 h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Live Availability</h3>
              <p className="text-blue-700 text-base leading-relaxed">
                Check real-time availability and unit counts. Know exactly what's open right now.
              </p>
            </div>
            
            <div className="group bg-white hover:bg-purple-50/50 border border-purple-200/60 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity className="text-purple-600 h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-4">Rich Amenities</h3>
              <p className="text-purple-700 text-base leading-relaxed">
                Explore pools, fitness centers, dining options, and activities that make a difference.
              </p>
            </div>
          </div>

          {/* Enhanced Data Collection Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-12 shadow-xl border border-blue-100/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-8 leading-tight">
                  How Our Data Collection Works
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mt-1 shadow-lg">
                      <span className="text-white text-lg font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Multi-Source Aggregation</h4>
                      <p className="text-gray-700 text-base leading-relaxed">We collect data from Google Places, Yelp, state licensing databases, and official community websites.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mt-1 shadow-lg">
                      <span className="text-white text-lg font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Data Verification</h4>
                      <p className="text-gray-700 text-base leading-relaxed">Information is cross-referenced across multiple sources and validated before being displayed.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mt-1 shadow-lg">
                      <span className="text-white text-lg font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Updates</h4>
                      <p className="text-gray-700 text-base leading-relaxed">Changes are immediately reflected in search results and community profiles for the most current information.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:text-center">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Data visualization and analytics dashboard"
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto hover:shadow-3xl transition-shadow duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12 xl:p-16 text-white">
                <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
                  Own a Senior Living Community?
                </h2>
                <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
                  Claim your community profile to ensure accurate information and showcase your transparency commitment to families.
                </p>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-5 w-5" />
                    </div>
                    <span className="text-lg">Update your community information in real-time</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-5 w-5" />
                    </div>
                    <span className="text-lg">Respond to family inquiries directly</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-5 w-5" />
                    </div>
                    <span className="text-lg">Showcase your compliance and transparency</span>
                  </div>
                </div>
                <Link href="/claim">
                  <Button variant="secondary" size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Claim Your Community
                  </Button>
                </Link>
              </div>
              <div className="hidden lg:block relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
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
  );
}
