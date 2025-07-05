import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Database, Clock, Star, CheckCircle, Users, Map, DollarSign, Award, Heart, Lightbulb, Target } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            About <span className="text-primary">TrueView</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            We're transforming how families find senior living communities through transparent pricing, 
            authentic reviews, and comprehensive data from trusted sources.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Database className="text-blue-600 h-5 w-5" />
              <span className="text-sm font-medium text-gray-800">182 Communities</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Map className="text-green-600 h-5 w-5" />
              <span className="text-sm font-medium text-gray-800">Northern California</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Shield className="text-purple-600 h-5 w-5" />
              <span className="text-sm font-medium text-gray-800">Verified Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Finding the right senior living community shouldn't be overwhelming or confusing. 
                We believe families deserve complete transparency when making one of life's most important decisions.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <DollarSign className="text-blue-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Transparent Pricing</h3>
                    <p className="text-gray-600 text-sm">Real monthly costs and fee structures with no hidden surprises</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <Star className="text-green-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Authentic Reviews</h3>
                    <p className="text-gray-600 text-sm">Real family experiences from Google, Yelp, and other trusted platforms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <Database className="text-purple-600 h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Verified Information</h3>
                    <p className="text-gray-600 text-sm">Cross-referenced data from state licensing and official sources</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <Card className="p-8 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Heart className="text-white h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Built for Families</h3>
                    <p className="text-gray-600">
                      Every feature is designed with families in mind, providing the tools and information 
                      needed to make confident decisions about senior care.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              How TrueView Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform aggregates and verifies information from multiple trusted sources 
              to provide the most comprehensive and accurate senior living data available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Data Collection</h3>
                <p className="text-gray-600 leading-relaxed">
                  We gather information from Google Places, Yelp, state licensing databases, 
                  and official community websites to build comprehensive profiles.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Verification</h3>
                <p className="text-gray-600 leading-relaxed">
                  All information is cross-referenced across multiple sources and verified 
                  for accuracy before being displayed to families.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Updates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our platform continuously monitors for changes and updates information 
                  to ensure families always have the most current data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at TrueView.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600 text-sm">Complete honesty in all our data and processes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Accuracy</h3>
              <p className="text-gray-600 text-sm">Verified information you can trust</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-600 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Compassion</h3>
              <p className="text-gray-600 text-sm">Understanding the importance of this decision</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-yellow-600 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">Continuously improving our platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Ready to Find the Right Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your search with transparent pricing and authentic reviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-shadow">
                <Target className="mr-2 h-5 w-5" />
                Start Searching
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-all">
                <Map className="mr-2 h-5 w-5" />
                Explore All Communities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}