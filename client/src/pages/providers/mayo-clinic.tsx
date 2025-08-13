import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Link } from "wouter";
import { 
  Phone, MapPin, Globe, Clock, Star, CheckCircle, 
  Award, Heart, Brain, Users, Building, Calendar,
  ArrowLeft, ExternalLink, Mail
} from "lucide-react";

export default function MayoClinicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/senior-healthcare-directory">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Healthcare Directory
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mayo Clinic</h1>
              <p className="text-xl opacity-90">World-Renowned Medical Care</p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white text-blue-600">Top Ranked</Badge>
                <Badge className="bg-white text-blue-600">Non-Profit</Badge>
                <Badge className="bg-white text-blue-600">Research Leader</Badge>
              </div>
            </div>
            <Building className="h-16 w-16 opacity-50" />
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
                <CardTitle>About Mayo Clinic</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Mayo Clinic is a nonprofit American academic medical center focused on integrated 
                  health care, education, and research. It employs over 4,500 physicians and scientists, 
                  along with over 58,400 administrative and allied health staff.
                </p>
                <p>
                  The practice specializes in treating difficult cases through tertiary care and 
                  destination medicine. It is home to the top-15 ranked Mayo Clinic School of Medicine 
                  in addition to many of the highest regarded residency education programs in the United States.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Services</CardTitle>
                <CardDescription>Comprehensive care across all specialties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Cardiology & Heart Surgery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>Neurology & Neurosurgery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Oncology</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Orthopedics</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Gastroenterology</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>Diabetes & Endocrinology</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span>Geriatrics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-teal-500" />
                      <span>Psychiatry</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Locations</CardTitle>
                <CardDescription>Three main campuses across the United States</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Rochester, Minnesota</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Main Campus - 200 First St. SW</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Phoenix/Scottsdale, Arizona</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">13400 E. Shea Blvd.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold">Jacksonville, Florida</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">4500 San Pablo Road</p>
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
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Main Line</p>
                    <a href="tel:507-284-2511" className="text-blue-600 hover:underline">
                      507-284-2511
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Website</p>
                    <a href="https://www.mayoclinic.org" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline flex items-center">
                      mayoclinic.org
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:contact@mayoclinic.org" className="text-blue-600 hover:underline">
                      contact@mayoclinic.org
                    </a>
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
                  <span className="font-semibold">1864</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-semibold">Non-profit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Physicians</span>
                  <span className="font-semibold">4,500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Staff</span>
                  <span className="font-semibold">63,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Annual Patients</span>
                  <span className="font-semibold">1.3M+</span>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Schedule an Appointment</CardTitle>
                <CardDescription>Get world-class care at Mayo Clinic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call 507-284-2511
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Request Appointment Online
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}