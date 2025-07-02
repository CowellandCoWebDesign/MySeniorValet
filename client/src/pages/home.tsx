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
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200"
            alt="Happy seniors enjoying activities at a senior living community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-white/60"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6">
              Find Senior Living with{" "}
              <span className="text-primary">Transparent Pricing</span> &{" "}
              <span className="text-green-600">Live Availability</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get real pricing, read authentic reviews, check live availability, and explore amenities to make confident decisions for your family.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-green-50 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-green-200">
                <DollarSign className="text-green-600 h-5 w-5" />
                <span className="text-sm font-bold text-green-800">Real Pricing</span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-50 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-yellow-200">
                <Star className="text-yellow-500 h-5 w-5" />
                <span className="text-sm font-bold text-yellow-800">Trusted Reviews</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-blue-200">
                <Clock className="text-blue-600 h-5 w-5" />
                <span className="text-sm font-bold text-blue-800">Live Availability</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-50 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-purple-200">
                <Activity className="text-purple-600 h-5 w-5" />
                <span className="text-sm font-bold text-purple-800">Rich Amenities</span>
              </div>
            </div>
          </div>

          <SearchBar />
          
          {/* Data Integrity Notice */}
          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-start space-x-3">
                <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Data Integrity Commitment:</strong> All community information comes from verified state licensing databases, official inspection reports, and authenticated sources. Verification status is clearly marked for each community.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Why TrueView is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide unprecedented transparency by automatically collecting and updating data from state licensing agencies in real-time.
            </p>
          </div>
          
          {/* KEY FEATURES - What Families Really Need */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-green-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Transparent Pricing</h3>
              <p className="text-green-700 text-sm">
                See real monthly costs, special offers, and pricing updates. No surprises or hidden fees.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-yellow-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-yellow-900 mb-2">Authentic Reviews</h3>
              <p className="text-yellow-700 text-sm">
                Read real Google reviews and family experiences to understand what life is really like.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Live Availability</h3>
              <p className="text-blue-700 text-sm">
                Check real-time availability and unit counts. Know exactly what's open right now.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="text-purple-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">Rich Amenities</h3>
              <p className="text-purple-700 text-sm">
                Explore pools, fitness centers, dining options, and activities that make a difference.
              </p>
            </div>
          </div>

          <Card className="gradient-hero border-0">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
                    How Our Data Collection Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Automated Web Scraping</h4>
                        <p className="text-gray-600">Our Cheerio-powered scrapers continuously monitor state licensing websites.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Data Verification</h4>
                        <p className="text-gray-600">Information is cross-referenced and validated before being added to our database.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Real-Time Updates</h4>
                        <p className="text-gray-600">Changes are immediately reflected in search results and community profiles.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:text-center">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                    alt="Data visualization and analytics dashboard"
                    className="rounded-xl shadow-lg w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="gradient-primary text-white border-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Own a Senior Living Community?
                </h2>
                <p className="text-lg mb-6 text-blue-100">
                  Claim your community profile to ensure accurate information and showcase your transparency commitment to families.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <Check className="text-secondary-300 h-5 w-5" />
                    <span>Update your community information in real-time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="text-secondary-300 h-5 w-5" />
                    <span>Respond to family inquiries directly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="text-secondary-300 h-5 w-5" />
                    <span>Showcase your compliance and transparency</span>
                  </div>
                </div>
                <Link href="/claim">
                  <Button variant="secondary" size="lg">
                    Claim Your Community
                  </Button>
                </Link>
              </CardContent>
              <div className="hidden lg:block">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Senior living community staff assisting residents"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
