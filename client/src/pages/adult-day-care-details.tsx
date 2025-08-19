import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Users, Phone, MapPin, Clock, Star, CheckCircle, Calendar,
  Heart, Shield, Activity, Brain, Award, FileText, DollarSign,
  ChevronRight, ArrowLeft, ExternalLink, AlertCircle, Zap,
  UserCheck, Music, Palette, Coffee, Sun, Bus, Utensils, Info
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdultDayCareDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data for demonstration - would come from API
  const center = {
    id: 1,
    name: "Sunshine Adult Day Center - Dallas",
    slug: slug,
    type: "Licensed Adult Day Care Center",
    description: "A vibrant community providing social engagement, therapeutic activities, and healthcare services for seniors during daytime hours",
    rating: 4.7,
    reviewCount: 256,
    address: "789 Community Center Drive, Dallas, TX 75209",
    phone: "(214) 555-3456",
    email: "info@sunshineadultday.com",
    website: "www.sunshineadultday.com",
    hours: "Monday-Friday: 7:30am-5:30pm, Saturday: 8am-2pm",
    yearsInBusiness: 22,
    capacity: 65,
    currentEnrollment: 52,
    staffRatio: "1:6",
    insuranceAccepted: ["Medicaid", "VA Benefits", "Long-term Care Insurance", "Private Pay"],
    certifications: [
      "State Licensed Adult Day Center",
      "National Adult Day Services Association Member",
      "Dementia Care Certified",
      "CDC Health & Safety Certified"
    ],
    specializations: [
      "Memory Care Programs",
      "Physical Rehabilitation",
      "Social Engagement",
      "Medication Management",
      "Nutritional Support",
      "Respite Care"
    ],
    languages: ["English", "Spanish", "Vietnamese", "Korean"],
    transportationRange: "15-mile radius",
    mealsProvided: ["Breakfast", "Lunch", "Snacks"],
    nursingAvailable: true
  };

  const services = [
    {
      category: "Health & Wellness Services",
      icon: Heart,
      items: [
        "Vital Signs Monitoring",
        "Medication Administration",
        "Blood Sugar Testing",
        "Physical Therapy Exercises",
        "Fall Prevention Programs",
        "Health Education Classes",
        "Podiatry Services",
        "Vision & Hearing Screenings"
      ]
    },
    {
      category: "Social & Recreational Activities",
      icon: Users,
      items: [
        "Group Exercise Classes",
        "Arts & Crafts Workshops",
        "Music Therapy Sessions",
        "Bingo & Card Games",
        "Movie Afternoons",
        "Birthday Celebrations",
        "Holiday Parties",
        "Intergenerational Programs"
      ]
    },
    {
      category: "Cognitive Stimulation",
      icon: Brain,
      items: [
        "Memory Enhancement Activities",
        "Brain Training Games",
        "Current Events Discussions",
        "Book Club",
        "Computer Classes",
        "Trivia Competitions",
        "Reminiscence Therapy",
        "Sensory Stimulation"
      ]
    },
    {
      category: "Support Services",
      icon: Shield,
      items: [
        "Personal Care Assistance",
        "Nutritious Meals & Snacks",
        "Door-to-Door Transportation",
        "Family Support Groups",
        "Care Coordination",
        "Social Work Services",
        "Caregiver Education",
        "Respite Care Relief"
      ]
    }
  ];

  const dailySchedule = [
    { time: "7:30-8:30am", activity: "Arrival & Continental Breakfast", icon: Coffee },
    { time: "8:30-9:00am", activity: "Morning Health Checks", icon: Heart },
    { time: "9:00-10:00am", activity: "Exercise & Movement Class", icon: Activity },
    { time: "10:00-11:00am", activity: "Cognitive Activities", icon: Brain },
    { time: "11:00-12:00pm", activity: "Creative Arts & Crafts", icon: Palette },
    { time: "12:00-1:00pm", activity: "Lunch & Rest Period", icon: Utensils },
    { time: "1:00-2:00pm", activity: "Music & Entertainment", icon: Music },
    { time: "2:00-3:00pm", activity: "Group Games & Socializing", icon: Users },
    { time: "3:00-3:30pm", activity: "Afternoon Snack", icon: Coffee },
    { time: "3:30-4:30pm", activity: "Special Programs", icon: Star },
    { time: "4:30-5:30pm", activity: "Relaxation & Departure", icon: Sun }
  ];

  const staff = [
    {
      name: "Nancy Williams, RN",
      role: "Program Director",
      experience: "18 years",
      specialties: ["Geriatric Care", "Dementia Management", "Program Development"],
      education: "BSN, Certified Dementia Practitioner"
    },
    {
      name: "Carlos Martinez, LCSW",
      role: "Social Worker",
      experience: "12 years",
      specialties: ["Family Support", "Care Planning", "Community Resources"],
      education: "Master's in Social Work"
    },
    {
      name: "Jennifer Park",
      role: "Activities Coordinator",
      experience: "10 years",
      specialties: ["Therapeutic Recreation", "Memory Care Activities", "Music Therapy"],
      education: "Bachelor's in Recreation Therapy"
    }
  ];

  const testimonials = [
    {
      author: "Michael R.",
      relationship: "Son of Participant",
      date: "March 2024",
      rating: 5,
      text: "This center has been a lifesaver for our family. Mom loves the activities and has made wonderful friends. The staff genuinely cares about each participant, and I have peace of mind knowing she's well cared for while I'm at work."
    },
    {
      author: "Dorothy S.",
      relationship: "Participant",
      date: "February 2024",
      rating: 5,
      text: "I look forward to coming here every day! The activities keep me active and engaged, and I've made the best friends. It's so much better than being home alone all day."
    }
  ];

  const pricing = [
    {
      service: "Full Day Program",
      rate: "$85-95/day",
      hours: "7:30am-5:30pm",
      includes: "All activities, meals, snacks, basic health monitoring"
    },
    {
      service: "Half Day Program",
      rate: "$50-60/day",
      hours: "4 hours",
      includes: "Activities, one meal, snack"
    },
    {
      service: "Extended Hours",
      rate: "+$15/hour",
      hours: "Before 7:30am or after 5:30pm",
      includes: "Extended supervision and care"
    },
    {
      service: "Transportation",
      rate: "$15-20/day",
      hours: "Round trip",
      includes: "Door-to-door service within 15 miles"
    },
    {
      service: "Respite Care Package",
      rate: "$400/week",
      hours: "5 days/week",
      includes: "Full program with priority enrollment"
    }
  ];

  const specialPrograms = [
    {
      name: "Memory Lane Program",
      description: "Specialized care for participants with Alzheimer's and dementia",
      frequency: "Daily",
      features: ["Structured routines", "Memory exercises", "Sensory activities", "Safe environment"]
    },
    {
      name: "Parkinson's Support Group",
      description: "Exercise and support specifically for Parkinson's patients",
      frequency: "Twice weekly",
      features: ["Movement therapy", "Voice exercises", "Peer support", "Education"]
    },
    {
      name: "Veterans Coffee Club",
      description: "Social group for military veterans",
      frequency: "Weekly",
      features: ["Shared experiences", "Honor ceremonies", "VA benefits assistance", "Camaraderie"]
    },
    {
      name: "Intergenerational Days",
      description: "Programs connecting seniors with local schools",
      frequency: "Monthly",
      features: ["Reading programs", "History sharing", "Art projects", "Mentoring"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Button
            variant="ghost"
            className="text-white hover:text-orange-100 mb-4"
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-orange-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    State Licensed
                  </Badge>
                  <Badge className="bg-amber-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Dementia Certified
                  </Badge>
                  <Badge className="bg-yellow-600 text-white">
                    <Bus className="h-3 w-3 mr-1" />
                    Transportation Available
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{center.name}</h1>
                <p className="text-xl text-orange-100 mb-6">{center.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold">{center.rating}</div>
                    <div className="text-orange-100 text-sm">Rating ({center.reviewCount} reviews)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{center.capacity}</div>
                    <div className="text-orange-100 text-sm">Daily Capacity</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{center.staffRatio}</div>
                    <div className="text-orange-100 text-sm">Staff Ratio</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{center.yearsInBusiness}</div>
                    <div className="text-orange-100 text-sm">Years Serving</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now: {center.phone}
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Tour
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <FileText className="mr-2 h-5 w-5" />
                    Free Assessment
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <Users className="h-32 w-32 text-white/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{center.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{center.hours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-gray-500" />
              <span>Meals: {center.mealsProvided.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-gray-500" />
              <span>{center.transportationRange}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Government PACE & Adult Day Services Information */}
            <Card className="border-2 border-orange-200 dark:border-orange-700">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Federal PACE Programs & Adult Day Services Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* PACE Program Information */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-green-800 dark:text-green-300">PACE Programs Overview (ACL 2024)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>70,000+ Participants:</strong> PACE serves seniors nationwide with $7B annual investment (ACL 2024)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>Comprehensive Care:</strong> Covers adult day services, medical care, medications, and transportation
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>155 PACE Centers:</strong> Operating in 32 states with federal/state partnership (CMS 2024)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>95% Home Living:</strong> PACE participants remain in their homes vs nursing facilities
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  {/* National Adult Day Services Statistics */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-blue-800 dark:text-blue-300">National Adult Day Services Statistics (CDC/NCHS 2024)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>5,570 Centers:</strong> Operating nationally serving 286,300 participants daily
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Average Age 75:</strong> 70% female participants, 30% with Alzheimer's/dementia
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Cost Savings:</strong> 40% less expensive than home health, 75% less than nursing homes
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Quality Outcomes:</strong> 87% improvement in social engagement metrics (NADSA 2024)
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Financial Assistance */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-purple-800 dark:text-purple-300">Financial Assistance Programs</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold mb-2">Federal Coverage:</p>
                        <ul className="space-y-1">
                          <li>• <strong>Medicaid:</strong> Covers in 95% of states via HCBS waivers</li>
                          <li>• <strong>VA Benefits:</strong> Adult Day Health Care for eligible veterans</li>
                          <li>• <strong>Title III-E:</strong> Respite care funding through AAAs</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Average Costs (NADSA 2024):</p>
                        <ul className="space-y-1">
                          <li>• <strong>National Average:</strong> $85/day (social model)</li>
                          <li>• <strong>Medical Model:</strong> $105/day with nursing</li>
                          <li>• <strong>Compare:</strong> Nursing home $297/day</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quality & Safety Standards */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-red-800 dark:text-red-300 mb-1">CDC Health & Safety Requirements</p>
                        <p className="text-red-700 dark:text-red-400">
                          • Background checks for all staff (required in 47 states) 
                          • 1:6 staff ratio minimum standard • Infection control protocols per CDC guidelines 
                          • Emergency preparedness plans • Medication management systems
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Resources */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Find Adult Day Services Near You:</h4>
                    <div className="text-sm space-y-1">
                      <p>• <strong>Eldercare Locator:</strong> 1-800-677-1116 (free referral service)</p>
                      <p>• <strong>NADSA Directory:</strong> nadsa.org/consumers/choosing-a-center</p>
                      <p>• <strong>PACE Locator:</strong> npaonline.org/find-a-pace-program</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About the Center */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-orange-600" />
                  About Our Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-400">
                    {center.name} provides a safe, engaging environment where seniors can enjoy their day while receiving the care and support they need. 
                    Our center offers a perfect solution for families seeking quality daytime care for their loved ones, providing both social engagement 
                    and health monitoring in a vibrant community setting.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-orange-600" />
                        Social Engagement
                      </h4>
                      <p className="text-sm mt-2">Combat isolation with meaningful friendships and group activities</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Heart className="h-4 w-4 text-amber-600" />
                        Health Support
                      </h4>
                      <p className="text-sm mt-2">Professional monitoring and assistance with medications and health needs</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        Respite Care
                      </h4>
                      <p className="text-sm mt-2">Give family caregivers essential breaks while ensuring quality care</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Specialized Care Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {center.specializations.map((spec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Brain className="h-5 w-5 text-orange-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">{spec}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Expert care and programming for {spec.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages & Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Languages Spoken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {center.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="py-2 px-4">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Payment Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {center.insuranceAccepted.map((insurance, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">{insurance}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Licenses & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {center.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typical Daily Schedule</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our structured daily routine provides consistency while offering variety in activities
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailySchedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                      <item.icon className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <div className="font-semibold">{item.time}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Special Events */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Special Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Monday: Music Monday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Live music performances and sing-alongs</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Tuesday: Trivia Tuesday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Brain games and trivia competitions</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Wednesday: Wellness Wednesday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Health education and exercise focus</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Thursday: Throwback Thursday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reminiscence therapy and nostalgia activities</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Friday: Fun Friday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Games, parties, and celebrations</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Saturday: Social Saturday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Community outings and special guests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {services.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-orange-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Staff Team */}
            <Card>
              <CardHeader>
                <CardTitle>Our Professional Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {staff.map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                      <p className="text-sm mt-2">Experience: {member.experience}</p>
                      <p className="text-sm">{member.education}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.specialties.map((specialty, sIndex) => (
                          <Badge key={sIndex} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            {specialPrograms.map((program, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-600" />
                    {program.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{program.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{program.frequency}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {program.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Enrollment Process */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Initial Inquiry</h4>
                      <p className="text-gray-600 dark:text-gray-400">Contact us to discuss your needs and schedule a tour</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Center Tour</h4>
                      <p className="text-gray-600 dark:text-gray-400">Visit our facility and meet our staff</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Assessment</h4>
                      <p className="text-gray-600 dark:text-gray-400">Complete health and needs assessment</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Trial Day</h4>
                      <p className="text-gray-600 dark:text-gray-400">Experience a complimentary day at the center</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold">Enrollment</h4>
                      <p className="text-gray-600 dark:text-gray-400">Complete paperwork and begin regular attendance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Pricing</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Flexible options to meet your care needs and budget
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricing.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{item.service}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.includes}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">{item.rate}</div>
                          <div className="text-xs text-gray-500">{item.hours}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Assistance */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Assistance Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Medicaid Coverage</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Medicaid waiver programs may cover costs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Assistance with application process</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Direct billing available</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Veterans Benefits</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>VA Aid & Attendance benefits accepted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Help with VA paperwork</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span>Special programs for veterans</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Sliding Scale Available:</strong> We offer reduced rates based on income for qualifying families. Contact us for details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Family Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border-l-4 border-orange-600 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.date}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">"{testimonial.text}"</p>
                      <p className="text-sm font-semibold">
                        — {testimonial.author}, {testimonial.relationship}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality & Satisfaction Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">97%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Family Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">89%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Health Improvement</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">93%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Would Recommend</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Experience a Day at Our Center</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Schedule a tour and complimentary trial day to see how we can enrich your loved one's life.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Phone className="mr-2 h-5 w-5" />
                Call {center.phone}
              </Button>
              <Button size="lg" variant="outline">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}