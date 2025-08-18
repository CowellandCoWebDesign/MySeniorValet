import React from 'react';
import { useParams, useLocation } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Clock, 
  Home, 
  Phone, 
  MapPin, 
  Star, 
  Calendar,
  Activity,
  Coffee,
  Music,
  Book,
  Gamepad2,
  Car,
  ShoppingCart,
  ChevronRight,
  CheckCircle,
  Shield,
  Award,
  ArrowLeft
} from 'lucide-react';

export default function CompanionCareDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const serviceDetails = {
    name: "Companion Care Services",
    category: "Social Support & Companionship",
    description: "Professional companion care services providing social interaction, emotional support, and assistance with daily activities to enhance quality of life for seniors.",
    rating: 4.8,
    reviews: 156,
    certified: true,
    availability: "24/7 Service Available",
    coverage: "In-Home & Community Support",
    responseTime: "Same-Day Service Available",
    
    services: [
      {
        category: "Social Companionship",
        items: [
          "Conversation and active listening",
          "Playing games and puzzles",
          "Reading books or newspapers together",
          "Watching TV or movies",
          "Sharing hobbies and interests",
          "Technology assistance (video calls with family)",
          "Letter writing and correspondence",
          "Photo album and memory sharing"
        ]
      },
      {
        category: "Activity Support",
        items: [
          "Walking and light exercise companion",
          "Accompaniment to social events",
          "Religious service attendance",
          "Senior center visits",
          "Library trips",
          "Coffee shop or restaurant outings",
          "Park visits and nature walks",
          "Arts and crafts activities"
        ]
      },
      {
        category: "Daily Living Assistance",
        items: [
          "Meal planning and preparation",
          "Light housekeeping",
          "Laundry assistance",
          "Plant and pet care",
          "Mail sorting and organization",
          "Appointment scheduling",
          "Medication reminders",
          "Safety monitoring"
        ]
      },
      {
        category: "Transportation & Errands",
        items: [
          "Doctor appointment transportation",
          "Grocery shopping assistance",
          "Pharmacy runs",
          "Banking errands",
          "Post office trips",
          "Hair salon/barber visits",
          "Family visit transportation",
          "Special event transportation"
        ]
      }
    ],

    specialPrograms: [
      {
        name: "Memory Care Companionship",
        description: "Specialized companion care for individuals with dementia or Alzheimer's",
        features: [
          "Cognitive stimulation activities",
          "Reminiscence therapy",
          "Structured daily routines",
          "Calming presence during confusion"
        ]
      },
      {
        name: "Hospital & Recovery Companion",
        description: "Support during hospital stays and post-surgery recovery",
        features: [
          "Hospital bedside companionship",
          "Advocacy during medical visits",
          "Recovery activity support",
          "Transition home assistance"
        ]
      },
      {
        name: "Respite Care Support",
        description: "Temporary relief for family caregivers",
        features: [
          "Flexible scheduling options",
          "Overnight companion care",
          "Weekend coverage",
          "Holiday support"
        ]
      }
    ],

    benefits: [
      {
        title: "Reduced Isolation",
        description: "Combat loneliness with regular social interaction",
        icon: Users
      },
      {
        title: "Enhanced Well-being",
        description: "Improve mental and emotional health through companionship",
        icon: Heart
      },
      {
        title: "Safety Monitoring",
        description: "Trained companions provide discrete safety oversight",
        icon: Shield
      },
      {
        title: "Family Peace of Mind",
        description: "Know your loved one has caring, reliable support",
        icon: Award
      }
    ],

    pricing: {
      hourly: "$25-35/hour",
      daily: "$200-280/day",
      weekly: "$1,200-1,680/week",
      overnight: "$150-200/night",
      note: "Rates vary by location and specific services needed"
    },

    insurance: [
      "Long-term care insurance may cover companion care",
      "Some Medicare Advantage plans offer coverage",
      "Veterans benefits may apply",
      "Private pay and sliding scale options available"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => setLocation('/senior-healthcare-directory')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Healthcare Directory
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Users className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {serviceDetails.name}
                </h1>
                <p className="text-xl text-rose-100">
                  {serviceDetails.category}
                </p>
              </div>
            </div>
            
            <p className="text-lg text-rose-50 mb-6 max-w-3xl">
              {serviceDetails.description}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                <Star className="mr-1 h-4 w-4 fill-current" />
                {serviceDetails.rating} ({serviceDetails.reviews} reviews)
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                <Clock className="mr-1 h-4 w-4" />
                {serviceDetails.availability}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                <Home className="mr-1 h-4 w-4" />
                {serviceDetails.coverage}
              </Badge>
              {serviceDetails.certified && (
                <Badge className="bg-green-500/20 text-white border-green-300/30 text-sm px-3 py-1">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Licensed & Insured
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-rose-600 hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                <Calendar className="mr-2 h-5 w-5" />
                Book Service
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="services" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="services" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="programs" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Programs
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Benefits
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Companion Care Services
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.services.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
                      <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        {category.category === "Social Companionship" && <Users className="h-5 w-5" />}
                        {category.category === "Activity Support" && <Activity className="h-5 w-5" />}
                        {category.category === "Daily Living Assistance" && <Home className="h-5 w-5" />}
                        {category.category === "Transportation & Errands" && <Car className="h-5 w-5" />}
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {category.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Activity Icons Section */}
            <Card className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle>Popular Companion Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Coffee className="h-8 w-8 text-rose-500 mb-2" />
                    <span className="text-sm font-medium">Coffee Outings</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Music className="h-8 w-8 text-rose-500 mb-2" />
                    <span className="text-sm font-medium">Music & Arts</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Book className="h-8 w-8 text-rose-500 mb-2" />
                    <span className="text-sm font-medium">Reading Together</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Gamepad2 className="h-8 w-8 text-rose-500 mb-2" />
                    <span className="text-sm font-medium">Games & Puzzles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Specialized Companion Care Programs
            </h2>
            
            <div className="space-y-6">
              {serviceDetails.specialPrograms.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
                      <CardTitle className="text-xl text-rose-600 dark:text-rose-400">
                        {program.name}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {program.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {program.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Benefits of Companion Care
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                          <benefit.icon className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle>Why Choose Professional Companion Care?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Professional companion care provides more than just company. Our trained companions offer:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span>Consistent, reliable companionship on your schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span>Professional boundaries and training in senior care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span>Background-checked and insured caregivers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span>Customized care plans based on individual preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Pricing & Insurance Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
                  <CardTitle>Service Rates</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">Hourly Rate</span>
                    <span className="text-xl font-bold text-rose-600">{serviceDetails.pricing.hourly}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">Daily Rate</span>
                    <span className="text-xl font-bold text-rose-600">{serviceDetails.pricing.daily}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">Weekly Rate</span>
                    <span className="text-xl font-bold text-rose-600">{serviceDetails.pricing.weekly}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">Overnight Rate</span>
                    <span className="text-xl font-bold text-rose-600">{serviceDetails.pricing.overnight}</span>
                  </div>
                  <p className="text-sm text-gray-500 italic pt-2">
                    {serviceDetails.pricing.note}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle>Insurance & Payment Options</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {serviceDetails.insurance.map((option, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{option}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Free Insurance Verification:</strong> Our team can help verify your insurance coverage and explain your benefits.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Get Started with Companion Care Today
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    Our caring companions are ready to provide the social support and assistance your loved one needs. 
                    Contact us for a free consultation and personalized care plan.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white">
                      <Phone className="mr-2 h-5 w-5" />
                      Call (555) 123-4567
                    </Button>
                    <Button size="lg" variant="outline">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Free Assessment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}