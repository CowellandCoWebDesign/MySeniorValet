import React from 'react';
import { useParams, useLocation } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  HeartHandshake, 
  Heart, 
  Clock, 
  Home, 
  Phone, 
  MapPin, 
  Star, 
  Calendar,
  Shield,
  Users,
  Stethoscope,
  Brain,
  Moon,
  Sun,
  ChevronRight,
  CheckCircle,
  Award,
  ArrowLeft,
  MessageCircle,
  Pill,
  Activity
} from 'lucide-react';

export default function HospiceCareDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const serviceDetails = {
    name: "Hospice Care Services",
    category: "End-of-Life Care & Comfort",
    description: "Compassionate hospice care focusing on comfort, dignity, and quality of life for patients and families during life's final journey. Our dedicated team provides comprehensive medical, emotional, and spiritual support.",
    rating: 4.9,
    reviews: 287,
    certified: true,
    availability: "24/7 On-Call Support",
    coverage: "Home, Facility & Hospital Care",
    responseTime: "Immediate Crisis Response",
    
    services: [
      {
        category: "Medical Care",
        items: [
          "Pain and symptom management",
          "24/7 nursing care coordination",
          "Physician oversight and visits",
          "Medication management and delivery",
          "Medical equipment and supplies",
          "Wound care and comfort measures",
          "Emergency response team",
          "Continuous care during crisis"
        ]
      },
      {
        category: "Personal Care Support",
        items: [
          "Assistance with daily activities",
          "Personal hygiene and grooming",
          "Mobility and positioning support",
          "Feeding assistance",
          "Skin care and prevention",
          "Comfort positioning",
          "Incontinence care",
          "Respite care for families"
        ]
      },
      {
        category: "Emotional & Spiritual Support",
        items: [
          "Chaplain services (all faiths)",
          "Grief and bereavement counseling",
          "Social work services",
          "Family support groups",
          "Life review and legacy work",
          "Emotional counseling",
          "Volunteer companionship",
          "Pet therapy visits"
        ]
      },
      {
        category: "Family Services",
        items: [
          "Family education and training",
          "24/7 family support hotline",
          "Caregiver respite services",
          "Bereavement support (13 months)",
          "Memorial services coordination",
          "Children's grief support",
          "Family counseling sessions",
          "Resource coordination"
        ]
      }
    ],

    careTeam: [
      {
        role: "Hospice Physician",
        responsibilities: "Medical direction, symptom management, care coordination"
      },
      {
        role: "Registered Nurses",
        responsibilities: "24/7 clinical care, symptom assessment, family education"
      },
      {
        role: "Certified Nursing Assistants",
        responsibilities: "Personal care, comfort measures, companionship"
      },
      {
        role: "Social Workers",
        responsibilities: "Emotional support, resource coordination, advance directives"
      },
      {
        role: "Chaplains",
        responsibilities: "Spiritual care, religious support, meaning-making"
      },
      {
        role: "Volunteers",
        responsibilities: "Companionship, respite care, special projects"
      }
    ],

    levels: [
      {
        name: "Routine Home Care",
        description: "Regular visits and 24/7 on-call support in patient's home",
        coverage: "Intermittent visits as needed"
      },
      {
        name: "Continuous Home Care",
        description: "8-24 hours of nursing care during crisis periods",
        coverage: "Around-the-clock care at home"
      },
      {
        name: "Inpatient Hospice Care",
        description: "Short-term care in hospice facility for symptom management",
        coverage: "24/7 facility-based care"
      },
      {
        name: "Respite Care",
        description: "Temporary inpatient care to give family caregivers a break",
        coverage: "Up to 5 days per benefit period"
      }
    ],

    benefits: [
      {
        title: "Comprehensive Pain Relief",
        description: "Expert pain management for maximum comfort",
        icon: Heart
      },
      {
        title: "Dignity & Quality of Life",
        description: "Focus on living well in remaining time",
        icon: Award
      },
      {
        title: "Family Support",
        description: "Care extends to entire family unit",
        icon: Users
      },
      {
        title: "No Out-of-Pocket Costs",
        description: "Medicare, Medicaid, and insurance coverage",
        icon: Shield
      }
    ],

    eligibility: [
      "Prognosis of 6 months or less if illness runs normal course",
      "Doctor's certification of terminal diagnosis",
      "Choice to focus on comfort rather than cure",
      "Can be provided alongside palliative treatments",
      "No requirement to stop all treatments",
      "Can be discontinued if condition improves"
    ],

    insuranceCoverage: {
      medicare: "Fully covered under Medicare Part A",
      medicaid: "Covered in all 50 states",
      private: "Most insurance plans include hospice benefit",
      veterans: "VA benefits available for eligible veterans",
      note: "All medications, equipment, and supplies related to terminal diagnosis covered"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white">
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
                <HeartHandshake className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {serviceDetails.name}
                </h1>
                <p className="text-xl text-teal-100">
                  {serviceDetails.category}
                </p>
              </div>
            </div>
            
            <p className="text-lg text-teal-50 mb-6 max-w-3xl">
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
                  Medicare Certified
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                24/7 Support Line
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                <Calendar className="mr-2 h-5 w-5" />
                Request Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="services" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="services" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Care Team
            </TabsTrigger>
            <TabsTrigger value="levels" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Care Levels
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Eligibility
            </TabsTrigger>
            <TabsTrigger value="coverage" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Coverage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Hospice Care Services
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
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                      <CardTitle className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                        {category.category === "Medical Care" && <Stethoscope className="h-5 w-5" />}
                        {category.category === "Personal Care Support" && <Heart className="h-5 w-5" />}
                        {category.category === "Emotional & Spiritual Support" && <Brain className="h-5 w-5" />}
                        {category.category === "Family Services" && <Users className="h-5 w-5" />}
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

            {/* Special Services Card */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Special Comfort Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <MessageCircle className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Music Therapy</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Heart className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Pet Therapy</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Sun className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Art Therapy</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Moon className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Massage Therapy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Your Dedicated Hospice Care Team
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceDetails.careTeam.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                      <CardTitle className="text-lg text-teal-600 dark:text-teal-400">
                        {member.role}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        {member.responsibilities}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Coordinated Team Approach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Our interdisciplinary team meets weekly to coordinate your care, ensuring all aspects of comfort and support are addressed:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Activity className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Weekly team meetings for care coordination</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>24/7 on-call nurse availability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Family involvement in care planning</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Continuous quality monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Levels of Hospice Care
            </h2>
            
            <div className="space-y-4">
              {serviceDetails.levels.map((level, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-teal-600 dark:text-teal-400">
                            {level.name}
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {level.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {level.coverage}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle>Seamless Transitions Between Care Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Care levels can be adjusted based on your needs without changing providers or disrupting continuity of care.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Home className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm mt-2">Home</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm mt-2">Crisis</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-sm mt-2">Inpatient</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Hospice Care Eligibility
            </h2>
            
            <Card>
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                <CardTitle>Eligibility Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {serviceDetails.eligibility.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle>Common Diagnoses</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>Cancer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>Heart Disease</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>Lung Disease</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>Dementia/Alzheimer's</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>Kidney Disease</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span>Liver Disease</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardTitle>Important to Know</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      You can continue curative treatments while on hospice if desired
                    </p>
                  </div>
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <p className="text-sm font-medium text-pink-800 dark:text-pink-200">
                      Hospice can be provided wherever you call home
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      You can leave hospice if your condition improves
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Insurance Coverage & Costs
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Medicare Hospice Benefit
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-semibold text-green-600 mb-3">{serviceDetails.insuranceCoverage.medicare}</p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ All hospice services</li>
                    <li>✓ Medications for symptom control</li>
                    <li>✓ Medical equipment and supplies</li>
                    <li>✓ 24/7 on-call support</li>
                    <li>✓ Short-term inpatient care</li>
                    <li>✓ Respite care</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Other Coverage Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="font-semibold text-blue-600">Medicaid</p>
                    <p className="text-sm">{serviceDetails.insuranceCoverage.medicaid}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">Private Insurance</p>
                    <p className="text-sm">{serviceDetails.insuranceCoverage.private}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">Veterans Benefits</p>
                    <p className="text-sm">{serviceDetails.insuranceCoverage.veterans}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader>
                <CardTitle>What's Covered at No Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {serviceDetails.insuranceCoverage.note}
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Pill className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-medium">All Medications</p>
                    <p className="text-sm text-gray-500">Related to diagnosis</p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Stethoscope className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-medium">Medical Equipment</p>
                    <p className="text-sm text-gray-500">Beds, oxygen, supplies</p>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-medium">All Team Visits</p>
                    <p className="text-sm text-gray-500">Nurses, doctors, aides</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Begin Your Hospice Journey with Compassion
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    Our caring team is here to support you and your family with dignity, comfort, and peace. 
                    Contact us for a free consultation to discuss your needs.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                      <Phone className="mr-2 h-5 w-5" />
                      Call 24/7: (555) 123-4567
                    </Button>
                    <Button size="lg" variant="outline">
                      <Calendar className="mr-2 h-5 w-5" />
                      Request Information
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