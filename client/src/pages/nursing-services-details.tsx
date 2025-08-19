import React from 'react';
import { useParams, useLocation } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Heart, 
  Clock, 
  Home, 
  Phone, 
  MapPin, 
  Star, 
  Calendar,
  Shield,
  Stethoscope,
  Activity,
  Pill,
  Syringe,
  FileText,
  ChevronRight,
  CheckCircle,
  Award,
  ArrowLeft,
  Thermometer,
  Brain,
  Eye,
  Zap,
  Info,
  AlertCircle
} from 'lucide-react';

export default function NursingServicesDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const serviceDetails = {
    name: "Skilled Nursing Services",
    category: "RN & LPN Professional Care",
    description: "Professional skilled nursing services providing comprehensive medical care, health monitoring, and specialized treatments in the comfort of your home. Our registered nurses and licensed practical nurses deliver hospital-quality care with compassion.",
    rating: 4.9,
    reviews: 512,
    certified: true,
    availability: "24/7 Nursing Coverage",
    coverage: "In-Home & Facility Care",
    responseTime: "Emergency Response Available",
    
    services: [
      {
        category: "Clinical Care",
        items: [
          "Medication administration and management",
          "IV therapy and infusion services",
          "Wound care and dressing changes",
          "Catheter and ostomy care",
          "Injection administration",
          "Blood draws and lab work",
          "Vital signs monitoring",
          "Pain management"
        ]
      },
      {
        category: "Health Assessment",
        items: [
          "Comprehensive health evaluations",
          "Disease monitoring and management",
          "Post-surgical care and monitoring",
          "Fall risk assessments",
          "Nutritional assessments",
          "Mental health evaluations",
          "Medication reviews",
          "Safety assessments"
        ]
      },
      {
        category: "Specialized Care",
        items: [
          "Diabetes management and education",
          "Cardiac care and monitoring",
          "Respiratory therapy support",
          "Neurological care",
          "Palliative care support",
          "Pediatric nursing",
          "Geriatric specialty care",
          "Rehabilitation nursing"
        ]
      },
      {
        category: "Education & Support",
        items: [
          "Patient and family education",
          "Disease management training",
          "Medication education",
          "Medical equipment training",
          "Nutrition counseling",
          "Care coordination",
          "Discharge planning",
          "Health promotion"
        ]
      }
    ],

    nursingLevels: [
      {
        title: "Registered Nurses (RN)",
        qualifications: "Bachelor's or Associate's degree in nursing, state licensure",
        responsibilities: [
          "Complex medical procedures",
          "Care plan development",
          "Patient assessments",
          "Medication administration",
          "IV therapy",
          "Patient education"
        ]
      },
      {
        title: "Licensed Practical Nurses (LPN)",
        qualifications: "Diploma or certificate program, state licensure",
        responsibilities: [
          "Basic medical care",
          "Vital signs monitoring",
          "Wound care",
          "Medication administration (under RN supervision)",
          "Patient comfort",
          "Documentation"
        ]
      }
    ],

    conditions: [
      "Post-surgical recovery",
      "Chronic disease management",
      "Heart disease and CHF",
      "Diabetes complications",
      "COPD and respiratory conditions",
      "Stroke recovery",
      "Cancer treatment support",
      "Wound care needs",
      "Neurological conditions",
      "Complex medication regimens"
    ],

    benefits: [
      {
        title: "Hospital-Level Care at Home",
        description: "Receive professional medical care without hospitalization",
        icon: Stethoscope
      },
      {
        title: "Faster Recovery",
        description: "Studies show patients recover faster at home",
        icon: Activity
      },
      {
        title: "Cost-Effective",
        description: "Lower costs than hospital or facility care",
        icon: Award
      },
      {
        title: "Personalized Attention",
        description: "One-on-one care tailored to your needs",
        icon: Heart
      }
    ],

    pricing: {
      rnHourly: "$75-95/hour",
      lpnHourly: "$55-75/hour",
      visitFee: "$150-250/visit",
      overnight: "$500-800/night",
      note: "Insurance often covers skilled nursing services"
    },

    insurance: [
      "Medicare Part A & B coverage for qualified patients",
      "Medicaid coverage available",
      "Most private insurance plans accepted",
      "Veterans benefits accepted",
      "Workers' compensation cases",
      "Direct billing to insurance available"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
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
                <UserCheck className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {serviceDetails.name}
                </h1>
                <p className="text-xl text-blue-100">
                  {serviceDetails.category}
                </p>
              </div>
            </div>
            
            <p className="text-lg text-blue-50 mb-6 max-w-3xl">
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
                  State Licensed
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Request Nurse Visit
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Assessment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="services" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="levels" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Nursing Levels
            </TabsTrigger>
            <TabsTrigger value="conditions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Conditions
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Benefits
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            {/* Government Skilled Nursing Information */}
            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Medicare Skilled Nursing Services & Federal Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Medicare Home Health Benefits */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-green-800 dark:text-green-300">Medicare Home Health Coverage (CMS 2024)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>3.4M Beneficiaries:</strong> Receive Medicare-certified home health services annually
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>100% Coverage:</strong> Medicare Part A covers skilled nursing when medically necessary
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>60-Day Episodes:</strong> Up to 60 days of covered care per certification period
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>No Copay:</strong> Zero out-of-pocket for qualifying Medicare beneficiaries
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Nursing Workforce Statistics */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-blue-800 dark:text-blue-300">Federal Nursing Workforce Data (HRSA 2024)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>5.2M Nurses:</strong> Registered nurses in U.S. (largest healthcare profession)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>950,000 LPNs:</strong> Licensed practical nurses providing direct care
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>11,700 Home Health Agencies:</strong> Medicare-certified agencies nationwide
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>203,000 Shortage:</strong> Projected RN shortage by 2031 (BLS)
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Quality & Safety Standards */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-purple-800 dark:text-purple-300">Federal Quality Standards (CMS Star Ratings)</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold mb-2">Quality Measures:</p>
                        <ul className="space-y-1">
                          <li>• Timely initiation of care</li>
                          <li>• Medication management</li>
                          <li>• Fall prevention</li>
                          <li>• Hospital readmission rates</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Patient Outcomes:</p>
                        <ul className="space-y-1">
                          <li>• 86% improvement in ambulation</li>
                          <li>• 71% improvement in bathing</li>
                          <li>• 22% rehospitalization rate</li>
                          <li>• 4.2/5 average patient satisfaction</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* VA Benefits */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 className="font-bold mb-3 text-yellow-800 dark:text-yellow-300">Veterans Skilled Home Care (VA 2024)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span><strong>Skilled Home Health:</strong> Covered for eligible veterans at no cost</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span><strong>146 VA Medical Centers:</strong> Coordinate home nursing services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span><strong>Home-Based Primary Care:</strong> Comprehensive care for complex needs</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Resources */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Find Skilled Nursing Services:</h4>
                    <div className="text-sm space-y-1">
                      <p>• <strong>Medicare.gov:</strong> Home Health Compare tool</p>
                      <p>• <strong>VA Benefits:</strong> 1-877-222-8387</p>
                      <p>• <strong>State Boards of Nursing:</strong> Verify nurse licenses</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Skilled Nursing Services
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
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        {category.category === "Clinical Care" && <Syringe className="h-5 w-5" />}
                        {category.category === "Health Assessment" && <Thermometer className="h-5 w-5" />}
                        {category.category === "Specialized Care" && <Brain className="h-5 w-5" />}
                        {category.category === "Education & Support" && <FileText className="h-5 w-5" />}
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

            {/* Special Skills Icons */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Specialized Nursing Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Syringe className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">IV Therapy</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Activity className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Wound Care</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Pill className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Medication</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Eye className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-center">Monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Professional Nursing Levels
            </h2>
            
            <div className="space-y-6">
              {serviceDetails.nursingLevels.map((level, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <CardTitle className="text-xl text-blue-600 dark:text-blue-400">
                        {level.title}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        <strong>Qualifications:</strong> {level.qualifications}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3">Key Responsibilities:</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {level.responsibilities.map((resp, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle>Nursing Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our nursing team works collaboratively with your healthcare providers to ensure seamless, coordinated care:
                </p>
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm">Doctor Orders</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserCheck className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-sm">Nurse Assessment</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm">Care Delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Conditions We Treat
            </h2>
            
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardTitle>Common Conditions Requiring Skilled Nursing</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {serviceDetails.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">{condition}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Cardiac Care
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2 text-sm">
                    <li>• CHF management</li>
                    <li>• Post-MI care</li>
                    <li>• Arrhythmia monitoring</li>
                    <li>• Blood pressure management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    Diabetes Care
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2 text-sm">
                    <li>• Blood sugar monitoring</li>
                    <li>• Insulin administration</li>
                    <li>• Foot care</li>
                    <li>• Diet education</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Post-Surgical
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2 text-sm">
                    <li>• Incision care</li>
                    <li>• Pain management</li>
                    <li>• Mobility support</li>
                    <li>• Complication prevention</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Benefits of Skilled Nursing Services
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
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <benefit.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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

            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Clinical Excellence Standards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Our skilled nursing services maintain the highest clinical standards:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>All nurses are state-licensed and background-checked</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Continuous education and training programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Stethoscope className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Evidence-based clinical protocols</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Electronic health records and documentation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Pricing & Insurance Coverage
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle>Service Rates</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">RN Hourly Rate</span>
                    <span className="text-xl font-bold text-blue-600">{serviceDetails.pricing.rnHourly}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">LPN Hourly Rate</span>
                    <span className="text-xl font-bold text-blue-600">{serviceDetails.pricing.lpnHourly}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">Visit Fee</span>
                    <span className="text-xl font-bold text-blue-600">{serviceDetails.pricing.visitFee}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-medium">Overnight Care</span>
                    <span className="text-xl font-bold text-blue-600">{serviceDetails.pricing.overnight}</span>
                  </div>
                  <p className="text-sm text-gray-500 italic pt-2">
                    {serviceDetails.pricing.note}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardTitle>Insurance Coverage</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {serviceDetails.insurance.map((option, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{option}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader>
                <CardTitle>Medicare Coverage Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Medicare covers skilled nursing services when:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Services are medically necessary</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Doctor orders the services</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Patient is homebound (for home care)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Agency is Medicare-certified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Start Your Skilled Nursing Care Today
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    Our experienced nurses are ready to provide the professional medical care you need. 
                    Contact us for a free consultation and insurance verification.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Phone className="mr-2 h-5 w-5" />
                      Call (555) 123-4567
                    </Button>
                    <Button size="lg" variant="outline">
                      <Calendar className="mr-2 h-5 w-5" />
                      Request Nurse Visit
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