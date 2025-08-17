import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/NavigationHeader";
import { 
  Home, Phone, MapPin, Clock, Star, CheckCircle, Calendar,
  Users, Heart, Shield, Activity, Award, FileText, DollarSign,
  ChevronRight, ArrowLeft, ExternalLink, AlertCircle, Zap,
  UserCheck, Stethoscope, Pill, Brain, HandHeart, Sun
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomeCareDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data for demonstration - would come from API
  const provider = {
    id: 1,
    name: "Comfort Keepers Home Care - Dallas",
    slug: slug,
    type: "Licensed Home Care Agency",
    description: "Providing compassionate in-home care services for seniors and adults with disabilities since 1998",
    rating: 4.8,
    reviewCount: 342,
    address: "1234 Main Street, Dallas, TX 75201",
    phone: "(214) 555-0123",
    email: "dallas@comfortkeepers.com",
    website: "www.comfortkeepers.com/dallas",
    hours: "24/7 Service Available",
    yearsInBusiness: 26,
    licensedStaff: 45,
    insuranceAccepted: ["Medicare", "Medicaid", "Private Insurance", "VA Benefits"],
    certifications: ["Licensed by Texas DADS", "BBB Accredited", "Home Care Association Member"],
    specializations: [
      "Alzheimer's & Dementia Care",
      "Post-Hospital Recovery",
      "Parkinson's Care",
      "Stroke Recovery",
      "Diabetes Management",
      "End-of-Life Comfort Care"
    ],
    languages: ["English", "Spanish", "Vietnamese", "Mandarin"],
    serviceArea: ["Dallas County", "Collin County", "Denton County", "Tarrant County"],
    emergencyAvailable: true,
    minimumHours: "4 hours per visit",
    rateRange: "$25-$35 per hour"
  };

  const services = [
    {
      category: "Personal Care Services",
      items: [
        "Bathing & Grooming Assistance",
        "Dressing & Hygiene Support",
        "Mobility & Transfer Assistance",
        "Toileting & Incontinence Care",
        "Skin Care & Wound Prevention",
        "Fall Prevention & Safety"
      ]
    },
    {
      category: "Companion Care",
      items: [
        "Social Companionship",
        "Conversation & Mental Stimulation",
        "Activity Planning & Engagement",
        "Hobby & Interest Support",
        "Pet Care Assistance",
        "Emotional Support"
      ]
    },
    {
      category: "Homemaking Services",
      items: [
        "Light Housekeeping",
        "Meal Preparation & Planning",
        "Grocery Shopping",
        "Laundry & Linen Service",
        "Organization & Decluttering",
        "Plant & Garden Care"
      ]
    },
    {
      category: "Medical Support",
      items: [
        "Medication Reminders",
        "Vital Signs Monitoring",
        "Doctor Appointment Transportation",
        "Medical Equipment Assistance",
        "Physical Therapy Exercises",
        "Post-Surgery Recovery Support"
      ]
    },
    {
      category: "Specialized Care",
      items: [
        "Memory Care Programs",
        "Respite Care for Families",
        "Palliative Care Support",
        "24-Hour Live-In Care",
        "Overnight Monitoring",
        "Complex Care Management"
      ]
    }
  ];

  const caregivers = [
    {
      name: "Maria Rodriguez, RN",
      role: "Lead Registered Nurse",
      experience: "15 years",
      specialties: ["Wound Care", "Diabetes Management", "Post-Hospital Care"],
      languages: ["English", "Spanish"],
      rating: 4.9
    },
    {
      name: "James Thompson, CNA",
      role: "Certified Nursing Assistant",
      experience: "8 years",
      specialties: ["Dementia Care", "Physical Therapy Support", "Personal Care"],
      languages: ["English"],
      rating: 4.8
    },
    {
      name: "Linda Chen, HHA",
      role: "Home Health Aide",
      experience: "12 years",
      specialties: ["Companion Care", "Meal Preparation", "Activity Planning"],
      languages: ["English", "Mandarin"],
      rating: 4.9
    }
  ];

  const testimonials = [
    {
      author: "Robert M.",
      relationship: "Son of Client",
      date: "March 2024",
      rating: 5,
      text: "Comfort Keepers has been a blessing for our family. The caregivers are professional, compassionate, and truly care about my mother's wellbeing. They've helped her maintain independence while ensuring she's safe and comfortable."
    },
    {
      author: "Susan K.",
      relationship: "Daughter of Client",
      date: "February 2024",
      rating: 5,
      text: "The team has been exceptional in caring for my father with Parkinson's. They understand his needs, provide excellent physical support, and most importantly, treat him with dignity and respect."
    }
  ];

  const pricing = [
    {
      service: "Companion Care",
      rate: "$25-28/hour",
      minimum: "4 hours",
      description: "Social companionship, light housekeeping, meal prep"
    },
    {
      service: "Personal Care",
      rate: "$28-32/hour",
      minimum: "4 hours",
      description: "ADL assistance, bathing, dressing, mobility support"
    },
    {
      service: "Skilled Nursing",
      rate: "$35-45/hour",
      minimum: "2 hours",
      description: "RN services, wound care, medication management"
    },
    {
      service: "24-Hour Live-In",
      rate: "$350-450/day",
      minimum: "1 week",
      description: "Round-the-clock care with dedicated caregiver"
    },
    {
      service: "Overnight Care",
      rate: "$250-300/night",
      minimum: "8 hours",
      description: "10pm-6am monitoring and assistance"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Button
            variant="ghost"
            className="text-white hover:text-green-100 mb-4"
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
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Licensed & Insured
                  </Badge>
                  <Badge className="bg-emerald-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    BBB Accredited
                  </Badge>
                  <Badge className="bg-teal-500 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    24/7 Available
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{provider.name}</h1>
                <p className="text-xl text-green-100 mb-6">{provider.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold">{provider.rating}</div>
                    <div className="text-green-100 text-sm">Rating ({provider.reviewCount} reviews)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{provider.licensedStaff}</div>
                    <div className="text-green-100 text-sm">Licensed Staff</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{provider.yearsInBusiness}</div>
                    <div className="text-green-100 text-sm">Years in Business</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-green-100 text-sm">Emergency Available</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now: {provider.phone}
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Consultation
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Visit Website
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <Home className="h-32 w-32 text-white/30" />
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
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>{provider.rateRange}</span>
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
          <TabsList className="grid grid-cols-5 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Service Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Service Coverage Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {provider.serviceArea.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Specialized Care Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.specializations.map((spec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Brain className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">{spec}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Specialized training and expertise in {spec.toLowerCase()}
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
                    <Users className="h-5 w-5 text-green-600" />
                    Languages Spoken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.languages.map((lang, index) => (
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
                    <Shield className="h-5 w-5 text-green-600" />
                    Insurance Accepted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.insuranceAccepted.map((insurance, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
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
                  <Award className="h-5 w-5 text-green-600" />
                  Licenses & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {provider.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{cert}</span>
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
                    <Heart className="h-5 w-5 text-green-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Care Process */}
            <Card>
              <CardHeader>
                <CardTitle>Our Care Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Initial Assessment</h4>
                      <p className="text-gray-600 dark:text-gray-400">Free in-home consultation to understand care needs and preferences</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Custom Care Plan</h4>
                      <p className="text-gray-600 dark:text-gray-400">Develop personalized care plan with family input and medical recommendations</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Caregiver Matching</h4>
                      <p className="text-gray-600 dark:text-gray-400">Match with qualified caregivers based on needs, personality, and preferences</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Ongoing Support</h4>
                      <p className="text-gray-600 dark:text-gray-400">Regular check-ins, care plan adjustments, and 24/7 support availability</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caregivers.map((caregiver, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{caregiver.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{caregiver.role}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        {caregiver.rating}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-semibold">Experience:</span>
                        <span className="text-sm ml-2">{caregiver.experience}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Specialties:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {caregiver.specialties.map((specialty, sIndex) => (
                            <Badge key={sIndex} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Languages:</span>
                        <span className="text-sm ml-2">{caregiver.languages.join(", ")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Training & Standards */}
            <Card>
              <CardHeader>
                <CardTitle>Caregiver Standards & Training</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Background Requirements
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• FBI criminal background check</li>
                      <li>• Drug screening and testing</li>
                      <li>• Reference verification</li>
                      <li>• License verification</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      Ongoing Training
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Monthly skill workshops</li>
                      <li>• Dementia care certification</li>
                      <li>• CPR & First Aid renewal</li>
                      <li>• Cultural sensitivity training</li>
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
                  Transparent pricing with no hidden fees. All rates include insurance and bonding.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricing.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{item.service}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{item.rate}</div>
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
                <CardTitle>Payment Options & Financial Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Accepted Payment Methods</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Private Pay (Check, Credit Card, ACH)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Long-Term Care Insurance
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Veterans Aid & Attendance Benefits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Medicaid (Select Programs)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Financial Assistance</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <HandHeart className="h-4 w-4 text-green-600" />
                        Sliding scale fees available
                      </li>
                      <li className="flex items-center gap-2">
                        <HandHeart className="h-4 w-4 text-green-600" />
                        Payment plans with 0% interest
                      </li>
                      <li className="flex items-center gap-2">
                        <HandHeart className="h-4 w-4 text-green-600" />
                        Free benefits consultation
                      </li>
                      <li className="flex items-center gap-2">
                        <HandHeart className="h-4 w-4 text-green-600" />
                        Assistance with insurance claims
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
                    <div key={index} className="border-l-4 border-green-600 pl-4 py-2">
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
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Client Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">4.8/5</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">92%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Would Recommend</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">85%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Long-term Clients</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Contact us today for a free consultation and learn how we can help your loved one live safely and comfortably at home.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
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