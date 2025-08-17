import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Heart, Phone, MapPin, Clock, Star, CheckCircle, Calendar,
  Users, Shield, Activity, Brain, Award, FileText, DollarSign,
  ChevronRight, ArrowLeft, ExternalLink, AlertCircle, Zap,
  UserCheck, Sparkles, HandHeart, Home, Sun, Moon
} from "lucide-react";
import { motion } from "framer-motion";

export default function PersonalCareDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data for demonstration - would come from API
  const provider = {
    id: 1,
    name: "Compassionate Care Partners - Dallas",
    slug: slug,
    type: "Personal Care Services Agency",
    description: "Providing dignified, compassionate assistance with activities of daily living to help seniors maintain independence and quality of life",
    rating: 4.8,
    reviewCount: 412,
    address: "2345 Care Center Boulevard, Dallas, TX 75215",
    phone: "(214) 555-6789",
    email: "care@compassionatepartners.com",
    website: "www.compassionatepartners.com",
    hours: "24/7 Services Available",
    yearsInBusiness: 15,
    caregivers: 78,
    clientsServed: 850,
    responseTime: "Same day service available",
    insuranceAccepted: ["Long-term Care Insurance", "Private Pay", "Some Medicare Advantage Plans"],
    certifications: [
      "State Licensed Personal Care Agency",
      "BBB A+ Rating",
      "HIPAA Compliant",
      "Bonded & Insured"
    ],
    specializations: [
      "Bathing & Hygiene Assistance",
      "Mobility Support",
      "Medication Reminders",
      "Meal Preparation",
      "Light Housekeeping",
      "Companionship"
    ],
    languages: ["English", "Spanish", "Vietnamese", "Tagalog"],
    serviceAreas: ["Dallas County", "Collin County", "Denton County"],
    minimumHours: "2 hours per visit",
    emergencyAvailable: true
  };

  const services = [
    {
      category: "Activities of Daily Living (ADLs)",
      icon: Heart,
      items: [
        "Bathing & Shower Assistance",
        "Grooming & Personal Hygiene",
        "Dressing Assistance",
        "Toileting & Incontinence Care",
        "Mobility & Transfer Support",
        "Eating & Feeding Assistance",
        "Positioning & Turning",
        "Skin Care & Pressure Sore Prevention"
      ]
    },
    {
      category: "Instrumental Activities",
      icon: Home,
      items: [
        "Meal Planning & Preparation",
        "Light Housekeeping",
        "Laundry & Linen Service",
        "Grocery Shopping",
        "Medication Reminders",
        "Transportation Assistance",
        "Pet Care",
        "Plant Care"
      ]
    },
    {
      category: "Health Support Services",
      icon: Activity,
      items: [
        "Vital Signs Monitoring",
        "Exercise Assistance",
        "Range of Motion Exercises",
        "Walking & Mobility Support",
        "Medical Appointment Reminders",
        "Prescription Pickup",
        "Medical Equipment Assistance",
        "Documentation for Healthcare Providers"
      ]
    },
    {
      category: "Emotional & Social Support",
      icon: Users,
      items: [
        "Companionship & Conversation",
        "Activity Engagement",
        "Reading & Games",
        "Memory Exercises",
        "Hobby Support",
        "Social Outings",
        "Family Communication",
        "Emotional Support"
      ]
    }
  ];

  const careProcess = [
    {
      step: 1,
      title: "Initial Consultation",
      description: "Free in-home assessment to understand care needs",
      duration: "1-2 hours",
      icon: FileText
    },
    {
      step: 2,
      title: "Care Plan Development",
      description: "Custom care plan tailored to individual needs",
      duration: "24 hours",
      icon: Brain
    },
    {
      step: 3,
      title: "Caregiver Matching",
      description: "Match with compatible, qualified caregivers",
      duration: "1-2 days",
      icon: Users
    },
    {
      step: 4,
      title: "Service Begins",
      description: "Caregiver arrives and begins providing care",
      duration: "As scheduled",
      icon: Heart
    },
    {
      step: 5,
      title: "Ongoing Support",
      description: "Regular check-ins and care plan adjustments",
      duration: "Continuous",
      icon: Shield
    }
  ];

  const caregivers = [
    {
      name: "Maria Gonzalez, CNA",
      role: "Lead Personal Care Aide",
      experience: "12 years",
      specialties: ["Dementia Care", "Diabetes Management", "Bilingual Services"],
      languages: ["English", "Spanish"],
      rating: 4.9,
      background: "Certified Nursing Assistant with specialized dementia training"
    },
    {
      name: "John Smith, HHA",
      role: "Home Health Aide",
      experience: "8 years",
      specialties: ["Post-Surgery Care", "Mobility Assistance", "Male Caregiver"],
      languages: ["English"],
      rating: 4.8,
      background: "Former physical therapy assistant"
    },
    {
      name: "Lisa Nguyen, PCT",
      role: "Patient Care Technician",
      experience: "10 years",
      specialties: ["Parkinson's Care", "Medication Management", "Wound Care"],
      languages: ["English", "Vietnamese"],
      rating: 4.9,
      background: "Hospital-trained patient care specialist"
    }
  ];

  const testimonials = [
    {
      author: "Jennifer M.",
      relationship: "Daughter of Client",
      date: "March 2024",
      rating: 5,
      text: "The caregivers have been absolutely wonderful with my mother. They treat her with such dignity and respect while helping with her daily needs. The difference in her mood and wellbeing has been remarkable."
    },
    {
      author: "Thomas R.",
      relationship: "Client",
      date: "February 2024",
      rating: 5,
      text: "After my stroke, I needed help with basic tasks. The team here has helped me regain my independence while ensuring I'm safe. They're professional, kind, and always on time."
    }
  ];

  const pricing = [
    {
      service: "Basic Personal Care",
      rate: "$22-25/hour",
      minimum: "2 hours",
      includes: "ADL assistance, companionship, light housekeeping"
    },
    {
      service: "Enhanced Care",
      rate: "$25-28/hour",
      minimum: "3 hours",
      includes: "All basic services plus meal prep, errands, transportation"
    },
    {
      service: "Overnight Care",
      rate: "$18-20/hour",
      minimum: "8 hours",
      includes: "Overnight monitoring, assistance as needed"
    },
    {
      service: "24-Hour Care",
      rate: "$320-380/day",
      minimum: "1 week",
      includes: "Round-the-clock care with rotating caregivers"
    },
    {
      service: "Weekend/Holiday",
      rate: "+$3-5/hour",
      minimum: "2 hours",
      includes: "Premium rates for weekend and holiday services"
    }
  ];

  const safetyProtocols = [
    "Comprehensive background checks on all caregivers",
    "Ongoing training and competency assessments",
    "COVID-19 safety protocols and PPE usage",
    "Fall prevention and home safety assessments",
    "Emergency response procedures",
    "HIPAA compliance for privacy protection",
    "Insurance and bonding for client protection",
    "24/7 on-call supervisor support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Button
            variant="ghost"
            className="text-white hover:text-pink-100 mb-4"
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
                  <Badge className="bg-pink-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    State Licensed
                  </Badge>
                  <Badge className="bg-rose-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Bonded & Insured
                  </Badge>
                  <Badge className="bg-red-600 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    24/7 Available
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{provider.name}</h1>
                <p className="text-xl text-pink-100 mb-6">{provider.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold">{provider.rating}</div>
                    <div className="text-pink-100 text-sm">Rating ({provider.reviewCount} reviews)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{provider.caregivers}</div>
                    <div className="text-pink-100 text-sm">Trained Caregivers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{provider.clientsServed}+</div>
                    <div className="text-pink-100 text-sm">Clients Served</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-pink-100 text-sm">Availability</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now: {provider.phone}
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <Calendar className="mr-2 h-5 w-5" />
                    Free Assessment
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <Zap className="mr-2 h-5 w-5" />
                    Same Day Service
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <HandHeart className="h-32 w-32 text-white/30" />
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
              <span>{provider.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{provider.hours}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span>{provider.responseTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Min: {provider.minimumHours}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Compassionate Personal Care Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-400">
                    Personal care services provide essential assistance with daily activities that many of us take for granted. 
                    Our trained caregivers help seniors and individuals with disabilities maintain their dignity, independence, 
                    and quality of life while remaining in the comfort of their own homes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-pink-600" />
                        Dignity Preserved
                      </h4>
                      <p className="text-sm mt-2">Respectful assistance that maintains independence</p>
                    </div>
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-rose-600" />
                        Safety First
                      </h4>
                      <p className="text-sm mt-2">Trained caregivers ensure safe daily activities</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        Personalized Care
                      </h4>
                      <p className="text-sm mt-2">Customized assistance based on individual needs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  Service Coverage Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {provider.serviceAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-pink-600" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  We provide services throughout the Dallas-Fort Worth metroplex with same-day availability in most areas.
                </p>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-pink-600" />
                  Core Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.specializations.map((spec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Heart className="h-5 w-5 text-pink-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">{spec}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Professional assistance with {spec.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-pink-600" />
                  Safety Protocols & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safetyProtocols.map((protocol, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-pink-600" />
                      <span className="text-sm">{protocol}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {services.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-pink-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-pink-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Special Considerations */}
            <Card>
              <CardHeader>
                <CardTitle>Special Care Considerations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-pink-600" />
                      Dementia & Alzheimer's Care
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Specialized training in memory care</li>
                      <li>• Patience and understanding approach</li>
                      <li>• Routine maintenance and structure</li>
                      <li>• Redirection techniques</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-pink-600" />
                      Post-Hospital Care
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Recovery assistance</li>
                      <li>• Wound care support</li>
                      <li>• Medication management</li>
                      <li>• Physical therapy exercises</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Care Process</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Simple steps to get started with personalized care
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {careProcess.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center">
                          <step.icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">Step {step.step}: {step.title}</h4>
                          <Badge variant="secondary">{step.duration}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Options */}
            <Card>
              <CardHeader>
                <CardTitle>Flexible Service Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Sun className="h-8 w-8 text-pink-600 mb-3" />
                    <h4 className="font-semibold mb-2">Daytime Care</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Regular daytime assistance with daily activities and companionship
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Moon className="h-8 w-8 text-pink-600 mb-3" />
                    <h4 className="font-semibold mb-2">Overnight Care</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Overnight monitoring and assistance for peace of mind
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-pink-600 mb-3" />
                    <h4 className="font-semibold mb-2">24-Hour Care</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Round-the-clock care with rotating professional caregivers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {caregivers.map((caregiver, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{caregiver.name}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">{caregiver.role}</p>
                      </div>
                      <Badge className="bg-pink-100 text-pink-800">
                        <Star className="h-3 w-3 mr-1" />
                        {caregiver.rating}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-semibold">Experience:</span>
                          <span className="text-sm ml-2">{caregiver.experience}</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold">Background:</span>
                          <p className="text-sm mt-1">{caregiver.background}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold">Languages:</span>
                          <span className="text-sm ml-2">{caregiver.languages.join(", ")}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Specialties:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {caregiver.specialties.map((specialty, sIndex) => (
                            <Badge key={sIndex} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Caregiver Standards */}
            <Card>
              <CardHeader>
                <CardTitle>Caregiver Standards & Training</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-pink-600" />
                      Screening Process
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Criminal background checks</li>
                      <li>• Reference verification</li>
                      <li>• Skills assessment</li>
                      <li>• Personality matching</li>
                      <li>• Health screenings</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-pink-600" />
                      Ongoing Training
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Monthly skills training</li>
                      <li>• Dementia care certification</li>
                      <li>• CPR & First Aid</li>
                      <li>• Infection control</li>
                      <li>• Communication skills</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Pricing</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transparent pricing with no hidden fees
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
                          <div className="text-lg font-bold text-pink-600">{item.rate}</div>
                          <div className="text-xs text-gray-500">Min: {item.minimum}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle>Payment & Insurance Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Accepted Payment Methods</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-pink-600" />
                        Private Pay (Cash, Check, Credit Card)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-pink-600" />
                        Long-term Care Insurance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-pink-600" />
                        Some Medicare Advantage Plans
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-pink-600" />
                        Payment plans available
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Cost-Saving Tips</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-pink-600" />
                        Bundle services for discounts
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-pink-600" />
                        Prepay for rate locks
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-pink-600" />
                        Referral bonuses available
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-pink-600" />
                        Senior discounts offered
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border-l-4 border-pink-600 pl-4 py-2">
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
                  <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">98%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Client Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-rose-600">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">On-Time Arrival</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">4.8/5</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">90%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Client Retention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-700">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Get the Care You Deserve</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Schedule a free in-home assessment to discuss your personal care needs and create a customized care plan.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                <Phone className="mr-2 h-5 w-5" />
                Call {provider.phone}
              </Button>
              <Button size="lg" variant="outline">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}