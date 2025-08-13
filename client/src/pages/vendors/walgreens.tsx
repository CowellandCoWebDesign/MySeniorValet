import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Link } from "wouter";
import { 
  Phone, MapPin, Globe, Clock, Star, CheckCircle, 
  Award, ShoppingCart, Truck, Users, Building, Calendar,
  ArrowLeft, ExternalLink, Mail, Heart, Pill, Shield
} from "lucide-react";

export default function WalgreensPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/senior-marketplace">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Senior Marketplace
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Walgreens</h1>
              <p className="text-xl opacity-90">Your Neighborhood Health Destination</p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white text-red-600">9,000+ Stores</Badge>
                <Badge className="bg-white text-red-600">24/7 Pharmacy</Badge>
                <Badge className="bg-white text-red-600">Senior Discounts</Badge>
              </div>
            </div>
            <ShoppingCart className="h-16 w-16 opacity-50" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Overview */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Walgreens</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Walgreens is one of America's largest pharmacy chains, serving millions of customers 
                  daily with prescription medications, health products, and everyday essentials. With over 
                  9,000 locations nationwide, Walgreens provides convenient access to healthcare services.
                </p>
                <p>
                  Beyond prescriptions, Walgreens offers immunizations, health screenings, photo services, 
                  and a wide range of beauty and personal care products. Many locations feature 24-hour 
                  pharmacies for emergency medication needs.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Senior Services & Benefits</CardTitle>
                <CardDescription>Special programs designed for seniors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Pill className="h-4 w-4 text-red-500" />
                      <span>Prescription Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>Medicare Part D</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Immunizations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Senior Day Discounts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-yellow-500" />
                      <span>Free Delivery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>Auto-Refill Service</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-indigo-500" />
                      <span>myWalgreens Rewards</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-teal-500" />
                      <span>Health Screenings</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card>
              <CardHeader>
                <CardTitle>Senior Discount Days</CardTitle>
                <CardDescription>Save more on select days each month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold">Senior Day - First Tuesday</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    20% off regular price items for customers 55+
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">AARP Members</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Additional discounts on select items with membership
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Medicare Advantage</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Special pricing on medications and OTC products
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Quick Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">Customer Service</p>
                    <a href="tel:1-800-925-4733" className="text-red-600 hover:underline">
                      1-800-WALGREENS
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">Website</p>
                    <a href="https://www.walgreens.com" target="_blank" rel="noopener noreferrer" 
                       className="text-red-600 hover:underline flex items-center">
                      walgreens.com
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">Store Hours</p>
                    <p className="text-sm">Varies by location</p>
                    <p className="text-sm">Many 24/7 pharmacies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Founded</span>
                  <span className="font-semibold">1901</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Locations</span>
                  <span className="font-semibold">9,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pharmacists</span>
                  <span className="font-semibold">85,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">myWalgreens Members</span>
                  <span className="font-semibold">100M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Prescriptions/Year</span>
                  <span className="font-semibold">1.2B+</span>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle>Start Saving Today</CardTitle>
                <CardDescription>Join myWalgreens for exclusive deals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Walgreens.com
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Nearby Store
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}