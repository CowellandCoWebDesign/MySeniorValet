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

export default function ClevelandClinicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Cleveland Clinic</h1>
              <p className="text-xl opacity-90">World-Class Healthcare Innovation</p>
              <div className="flex items-center mt-4 space-x-4">
                <Badge className="bg-white text-green-600">#2 Hospital</Badge>
                <Badge className="bg-white text-green-600">Heart Care Leader</Badge>
                <Badge className="bg-white text-green-600">6,500+ Beds</Badge>
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
                <CardTitle>About Cleveland Clinic</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Cleveland Clinic is a nonprofit multispecialty academic medical center that integrates 
                  clinical and hospital care with research and education. It is consistently ranked as one 
                  of the top hospitals in the United States.
                </p>
                <p>
                  Founded in 1921, Cleveland Clinic has pioneered many medical breakthroughs, including 
                  coronary artery bypass surgery and the first face transplant in the United States. 
                  The main campus is home to over 1,400 beds and includes the Cleveland Clinic Children's Hospital.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Centers of Excellence</CardTitle>
                <CardDescription>Specialized institutes for comprehensive care</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Heart & Vascular Institute</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span>Neurological Institute</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Cancer Center</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Orthopaedic & Rheumatologic</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Digestive Disease Institute</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>Endocrinology & Metabolism</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span>Respiratory Institute</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-teal-500" />
                      <span>Eye Institute</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Locations</CardTitle>
                <CardDescription>Multiple facilities across Ohio and beyond</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Main Campus - Cleveland, Ohio</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">9500 Euclid Avenue</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Weston, Florida</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2950 Cleveland Clinic Blvd</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Las Vegas, Nevada</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">5860 S Durango Dr</p>
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
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Main Line</p>
                    <a href="tel:216-444-2200" className="text-green-600 hover:underline">
                      216-444-2200
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Website</p>
                    <a href="https://clevelandclinic.org" target="_blank" rel="noopener noreferrer" 
                       className="text-green-600 hover:underline flex items-center">
                      clevelandclinic.org
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:info@clevelandclinic.org" className="text-green-600 hover:underline">
                      info@clevelandclinic.org
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
                  <span className="font-semibold">1921</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Physicians</span>
                  <span className="font-semibold">5,050+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Employees</span>
                  <span className="font-semibold">72,500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Annual Visits</span>
                  <span className="font-semibold">10.2M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Locations</span>
                  <span className="font-semibold">22 Hospitals</span>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
              <CardHeader>
                <CardTitle>Schedule an Appointment</CardTitle>
                <CardDescription>Experience world-class care</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Call 216-444-2200
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