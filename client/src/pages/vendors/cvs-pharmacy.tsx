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

export default function CVSPharmacyPage() {
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
        <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">CVS Pharmacy</h1>
              <p className="text-xl opacity-90">Health is Everything</p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white text-red-700">9,900+ Stores</Badge>
                <Badge className="bg-white text-red-700">MinuteClinic</Badge>
                <Badge className="bg-white text-red-700">ExtraCare Rewards</Badge>
              </div>
            </div>
            <Heart className="h-16 w-16 opacity-50" />
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
                <CardTitle>About CVS Pharmacy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  CVS Pharmacy is the retail division of CVS Health, the nation's largest provider of 
                  prescriptions and related healthcare services. With nearly 10,000 retail locations, 
                  CVS makes health and wellness accessible to millions of Americans.
                </p>
                <p>
                  CVS pioneered the integration of pharmacy services with walk-in medical clinics through 
                  MinuteClinic, offering convenient healthcare services without appointments. The company 
                  also operates specialty pharmacies and provides comprehensive Medicare Part D services.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Senior Services & Programs</CardTitle>
                <CardDescription>Comprehensive healthcare support for older adults</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Pill className="h-4 w-4 text-red-500" />
                      <span>Medication Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>Chronic Care Programs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Flu & COVID Vaccines</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-green-500" />
                      <span>MinuteClinic Services</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-yellow-500" />
                      <span>Home Delivery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>Rx Ready Reminders</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-indigo-500" />
                      <span>ExtraCare Savings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-teal-500" />
                      <span>CarePass Membership</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Programs */}
            <Card>
              <CardHeader>
                <CardTitle>Medicare & Senior Programs</CardTitle>
                <CardDescription>Tailored services for Medicare beneficiaries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold">SilverScript Medicare Part D</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive prescription drug coverage plans
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Specialty Pharmacy Services</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complex medication management and support
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">ExtraCare 65+</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    20% off CVS Health brand items every day
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
                  <Phone className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Customer Service</p>
                    <a href="tel:1-800-746-7287" className="text-red-600 hover:underline">
                      1-800-SHOP-CVS
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Website</p>
                    <a href="https://www.cvs.com" target="_blank" rel="noopener noreferrer" 
                       className="text-red-600 hover:underline flex items-center">
                      cvs.com
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Pharmacy Hours</p>
                    <p className="text-sm">Most: 9am-9pm Mon-Fri</p>
                    <p className="text-sm">9am-6pm Sat-Sun</p>
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
                  <span className="font-semibold">1963</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Locations</span>
                  <span className="font-semibold">9,900+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">MinuteClinics</span>
                  <span className="font-semibold">1,200+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ExtraCare Members</span>
                  <span className="font-semibold">74M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Employees</span>
                  <span className="font-semibold">300,000+</span>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle>Join ExtraCare Today</CardTitle>
                <CardDescription>Save more with exclusive rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-red-700 hover:bg-red-800" size="lg">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit CVS.com
                </Button>
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find a Store Near You
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}