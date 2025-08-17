import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/NavigationHeader";
import { 
  Activity, Phone, MapPin, Clock, Star, CheckCircle, Calendar,
  Users, Heart, Shield, Brain, Award, FileText, DollarSign,
  ChevronRight, ArrowLeft, ExternalLink, AlertCircle, Zap,
  UserCheck, Stethoscope, Dumbbell, MessageSquare, Eye, Ear
} from "lucide-react";
import { motion } from "framer-motion";

export default function TherapyServicesDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data for demonstration - would come from API
  const provider = {
    id: 1,
    name: "Advanced Therapy Solutions - Dallas",
    slug: slug,
    type: "Comprehensive Rehabilitation Center",
    description: "Leading provider of physical, occupational, and speech therapy services with state-of-the-art facilities and expert therapists",
    rating: 4.9,
    reviewCount: 487,
    address: "5678 Medical Plaza Drive, Dallas, TX 75230",
    phone: "(214) 555-7890",
    email: "info@advancedtherapydallas.com",
    website: "www.advancedtherapydallas.com",
    hours: "Monday-Friday: 7am-7pm, Saturday: 8am-4pm",
    yearsInBusiness: 18,
    therapists: 32,
    insuranceAccepted: ["Medicare", "Medicaid", "Blue Cross", "Aetna", "United Healthcare", "Cigna"],
    certifications: [
      "CARF Accredited",
      "Medicare Certified",
      "APTA Member Facility",
      "Joint Commission Certified"
    ],
    specializations: [
      "Post-Surgical Rehabilitation",
      "Stroke Recovery",
      "Sports Injury Recovery",
      "Pediatric Therapy",
      "Geriatric Rehabilitation",
      "Neurological Disorders"
    ],
    languages: ["English", "Spanish", "Vietnamese", "ASL"],
    serviceLocations: ["In-Clinic", "In-Home", "Telehealth", "Schools", "Nursing Facilities"],
    emergencyAvailable: false,
    waitTime: "Usually within 48 hours",
    sessionLength: "45-60 minutes"
  };

  const services = [
    {
      category: "Physical Therapy",
      icon: Dumbbell,
      items: [
        "Orthopedic Rehabilitation",
        "Balance & Fall Prevention",
        "Gait Training & Mobility",
        "Manual Therapy Techniques",
        "Strength & Conditioning",
        "Pain Management",
        "Post-Operative Recovery",
        "Aquatic Therapy"
      ]
    },
    {
      category: "Occupational Therapy",
      icon: Activity,
      items: [
        "Activities of Daily Living Training",
        "Fine Motor Skills Development",
        "Cognitive Rehabilitation",
        "Work Injury Recovery",
        "Adaptive Equipment Training",
        "Home Safety Assessments",
        "Sensory Integration",
        "Hand Therapy"
      ]
    },
    {
      category: "Speech Therapy",
      icon: MessageSquare,
      items: [
        "Speech Sound Disorders",
        "Language Development",
        "Swallowing Disorders (Dysphagia)",
        "Voice Disorders",
        "Cognitive-Communication",
        "Aphasia Treatment",
        "AAC Device Training",
        "Stuttering Therapy"
      ]
    },
    {
      category: "Specialized Programs",
      icon: Brain,
      items: [
        "Parkinson's BIG & LOUD Program",
        "Vestibular Rehabilitation",
        "Lymphedema Management",
        "Chronic Pain Program",
        "Cardiac Rehabilitation",
        "Pulmonary Rehabilitation",
        "Pelvic Floor Therapy",
        "Pediatric Development"
      ]
    }
  ];

  const therapists = [
    {
      name: "Dr. Sarah Mitchell, DPT",
      role: "Director of Physical Therapy",
      experience: "20 years",
      specialties: ["Orthopedics", "Sports Medicine", "Manual Therapy"],
      education: "Doctor of Physical Therapy - UT Southwestern",
      certifications: ["Board Certified Orthopedic Specialist", "Dry Needling Certified"],
      rating: 4.9
    },
    {
      name: "Jennifer Lee, OTR/L",
      role: "Lead Occupational Therapist",
      experience: "15 years",
      specialties: ["Hand Therapy", "Neurological Rehab", "Pediatrics"],
      education: "Master's in OT - Texas Woman's University",
      certifications: ["Certified Hand Therapist", "Sensory Integration Certified"],
      rating: 4.8
    },
    {
      name: "Michael Rodriguez, CCC-SLP",
      role: "Speech-Language Pathologist",
      experience: "12 years",
      specialties: ["Dysphagia", "Aphasia", "Voice Disorders"],
      education: "Master's in Speech Pathology - UTD",
      certifications: ["VitalStim Certified", "LSVT LOUD Certified"],
      rating: 5.0
    }
  ];

  const testimonials = [
    {
      author: "Patricia H.",
      condition: "Knee Replacement Recovery",
      date: "March 2024",
      rating: 5,
      text: "After my knee replacement, the physical therapy team here was incredible. They pushed me when I needed it and provided excellent support throughout my recovery. I'm now walking better than I have in years!"
    },
    {
      author: "James T.",
      condition: "Stroke Recovery",
      date: "February 2024",
      rating: 5,
      text: "The comprehensive approach with PT, OT, and speech therapy all under one roof made my recovery so much easier. The therapists coordinate with each other and my progress has been remarkable."
    }
  ];

  const pricing = [
    {
      service: "Initial Evaluation",
      rate: "$150-200",
      duration: "60-90 minutes",
      description: "Comprehensive assessment and treatment plan development"
    },
    {
      service: "Physical Therapy Session",
      rate: "$100-125",
      duration: "45-60 minutes",
      description: "Individual PT session with licensed therapist"
    },
    {
      service: "Occupational Therapy",
      rate: "$110-130",
      duration: "45-60 minutes",
      description: "OT session focusing on daily living skills"
    },
    {
      service: "Speech Therapy",
      rate: "$120-140",
      duration: "30-45 minutes",
      description: "Speech and language therapy session"
    },
    {
      service: "Group Therapy",
      rate: "$50-70",
      duration: "60 minutes",
      description: "Small group sessions (3-5 patients)"
    },
    {
      service: "Telehealth Session",
      rate: "$80-100",
      duration: "30-45 minutes",
      description: "Virtual therapy session via secure video"
    }
  ];

  const equipment = [
    "Anti-Gravity Treadmill",
    "Biodex Balance System",
    "LSVT BIG Equipment",
    "Therapeutic Pool",
    "Functional Electrical Stimulation",
    "Ultrasound Therapy",
    "Laser Therapy System",
    "Virtual Reality Rehab System"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <Button
            variant="ghost"
            className="text-white hover:text-purple-100 mb-4"
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
                  <Badge className="bg-purple-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    CARF Accredited
                  </Badge>
                  <Badge className="bg-indigo-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Medicare Certified
                  </Badge>
                  <Badge className="bg-blue-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Excellence Award 2024
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{provider.name}</h1>
                <p className="text-xl text-purple-100 mb-6">{provider.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-3xl font-bold">{provider.rating}</div>
                    <div className="text-purple-100 text-sm">Rating ({provider.reviewCount} reviews)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{provider.therapists}</div>
                    <div className="text-purple-100 text-sm">Expert Therapists</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{provider.yearsInBusiness}</div>
                    <div className="text-purple-100 text-sm">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">48hr</div>
                    <div className="text-purple-100 text-sm">Appointment Wait</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now: {provider.phone}
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Evaluation
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Virtual Consultation
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <Activity className="h-32 w-32 text-white/30" />
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
              <Activity className="h-4 w-4 text-gray-500" />
              <span>{provider.sessionLength} sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Wait: {provider.waitTime}</span>
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
            <TabsTrigger value="therapists">Therapists</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Service Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Service Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {provider.serviceLocations.map((location, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Clinical Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.specializations.map((spec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Activity className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">{spec}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Evidence-based treatment protocols for {spec.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment & Technology */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                  Advanced Equipment & Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {equipment.map((item, index) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                      <span className="text-sm font-medium">{item}</span>
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
                    <Users className="h-5 w-5 text-purple-600" />
                    Languages Available
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    Interpreter services available for 20+ additional languages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Insurance Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.insuranceAccepted.map((insurance, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
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
                  <Award className="h-5 w-5 text-purple-600" />
                  Accreditations & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {provider.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
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
                    <category.icon className="h-5 w-5 text-purple-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Treatment Process */}
            <Card>
              <CardHeader>
                <CardTitle>Our Treatment Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Comprehensive Evaluation</h4>
                      <p className="text-gray-600 dark:text-gray-400">60-90 minute assessment to understand your condition and goals</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Personalized Treatment Plan</h4>
                      <p className="text-gray-600 dark:text-gray-400">Custom therapy program designed for your specific needs</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Active Treatment Sessions</h4>
                      <p className="text-gray-600 dark:text-gray-400">Hands-on therapy with expert guidance and support</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Progress Monitoring</h4>
                      <p className="text-gray-600 dark:text-gray-400">Regular assessments to track improvement and adjust treatment</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold">Home Exercise Program</h4>
                      <p className="text-gray-600 dark:text-gray-400">Customized exercises to continue progress between sessions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="therapists" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {therapists.map((therapist, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{therapist.name}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">{therapist.role}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        <Star className="h-3 w-3 mr-1" />
                        {therapist.rating}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-semibold">Experience:</span>
                          <span className="text-sm ml-2">{therapist.experience}</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold">Education:</span>
                          <p className="text-sm mt-1">{therapist.education}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold">Certifications:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {therapist.certifications.map((cert, cIndex) => (
                              <Badge key={cIndex} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Clinical Specialties:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {therapist.specialties.map((specialty, sIndex) => (
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

            {/* Clinical Excellence */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Excellence Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      Continuing Education
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Minimum 30 hours annual CEUs required</li>
                      <li>• Regular specialty certification updates</li>
                      <li>• Evidence-based practice training</li>
                      <li>• Technology and equipment training</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-purple-600" />
                      Quality Measures
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Patient satisfaction surveys</li>
                      <li>• Outcome measurement tracking</li>
                      <li>• Peer review processes</li>
                      <li>• Clinical documentation audits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Therapy Service Pricing</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Insurance typically covers 80-100% of therapy services with proper authorization
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
                          <div className="text-lg font-bold text-purple-600">{item.rate}</div>
                          <div className="text-xs text-gray-500">{item.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance Coverage & Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Medicare Coverage</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Part B covers 80% after deductible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>No limit on medically necessary visits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Direct billing available</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Private Insurance</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Most plans cover 20-60 visits/year</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Pre-authorization assistance provided</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                        <span>Copay typically $10-50 per visit</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Free Insurance Verification:</strong> Our billing team will verify your coverage and explain your benefits before starting treatment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Success Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border-l-4 border-purple-600 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Badge variant="secondary">{testimonial.condition}</Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.date}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">"{testimonial.text}"</p>
                      <p className="text-sm font-semibold">— {testimonial.author}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Outcomes & Success Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Outcomes & Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Patient Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">87%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Goal Achievement</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">91%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Return to Function</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">96%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Would Recommend</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Common Conditions Treated Successfully</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-sm">
                      <strong>Orthopedic:</strong> Joint replacements, fractures, arthritis
                    </div>
                    <div className="text-sm">
                      <strong>Neurological:</strong> Stroke, Parkinson's, MS
                    </div>
                    <div className="text-sm">
                      <strong>Pediatric:</strong> Developmental delays, autism, CP
                    </div>
                    <div className="text-sm">
                      <strong>Sports:</strong> ACL tears, rotator cuff, tennis elbow
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Start Your Recovery Journey Today</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Schedule your comprehensive evaluation and take the first step toward better health and function.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Phone className="mr-2 h-5 w-5" />
                Call {provider.phone}
              </Button>
              <Button size="lg" variant="outline">
                <Calendar className="mr-2 h-5 w-5" />
                Online Scheduling
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}