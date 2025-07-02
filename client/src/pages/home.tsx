import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FolderSync, MapPin, Database, Tag, Map, Check } from "lucide-react";
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
              Find Senior Living Communities with{" "}
              <span className="text-primary">Real-Time Transparency</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Access up-to-date licensing information, inspection reports, and verified community data to make informed decisions for your loved ones.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-start space-x-3">
                <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Data Integrity Commitment:</strong> All community information comes from verified state licensing databases, official inspection reports, and authenticated sources. We never display unverified or placeholder data.
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-white/50">
                <Shield className="text-secondary h-5 w-5" />
                <span className="text-sm font-semibold text-gray-800">Licensed & Verified</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-white/50">
                <FolderSync className="text-primary h-5 w-5" />
                <span className="text-sm font-semibold text-gray-800">Real-Time Data</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full shadow-sm border border-white/50">
                <MapPin className="text-orange-500 h-5 w-5" />
                <span className="text-sm font-semibold text-gray-800">Location-Based</span>
              </div>
            </div>
          </div>

          <SearchBar />
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Data</h3>
              <p className="text-gray-600">
                Our automated scrapers check state licensing databases daily, ensuring you always have the most current information.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-secondary h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Licensing Transparency</h3>
              <p className="text-gray-600">
                View inspection reports, violations, compliance status, and licensing history for every community in our database.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="text-orange-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Intelligence</h3>
              <p className="text-gray-600">
                Search by proximity to family, healthcare facilities, and important amenities to find the perfect location.
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
