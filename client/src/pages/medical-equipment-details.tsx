import React from 'react';
import { useParams, useLocation } from 'wouter';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Heart, 
  Clock, 
  Home, 
  Phone, 
  MapPin, 
  Star, 
  Calendar,
  Shield,
  Truck,
  Wrench,
  Package,
  ChevronRight,
  CheckCircle,
  Award,
  ArrowLeft,
  Zap,
  Activity,
  BedDouble,
  Wind,
  Accessibility,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

export default function MedicalEquipmentDetails() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const serviceDetails = {
    name: "Durable Medical Equipment (DME)",
    category: "Medical Equipment & Supplies",
    description: "Complete durable medical equipment solutions providing essential mobility aids, respiratory equipment, and home medical supplies to enhance independence and quality of life for seniors and patients.",
    rating: 4.7,
    reviews: 423,
    certified: true,
    availability: "24/7 Emergency Service",
    coverage: "Home Delivery & Setup",
    responseTime: "Same-Day Delivery Available",
    
    equipment: [
      {
        category: "Mobility Equipment",
        items: [
          "Manual wheelchairs",
          "Power wheelchairs",
          "Transport chairs",
          "Walkers and rollators",
          "Canes and crutches",
          "Knee scooters",
          "Transfer boards",
          "Stair lifts"
        ]
      },
      {
        category: "Bedroom & Bathroom",
        items: [
          "Hospital beds (manual/electric)",
          "Bed rails and assists",
          "Overbed tables",
          "Lift chairs",
          "Commodes and raised toilet seats",
          "Shower chairs and benches",
          "Grab bars and safety rails",
          "Patient lifts (Hoyer lifts)"
        ]
      },
      {
        category: "Respiratory Equipment",
        items: [
          "Oxygen concentrators",
          "Portable oxygen systems",
          "CPAP/BiPAP machines",
          "Nebulizers",
          "Suction machines",
          "Pulse oximeters",
          "Ventilators",
          "Oxygen supplies and accessories"
        ]
      },
      {
        category: "Daily Living Aids",
        items: [
          "Compression stockings",
          "Diabetic supplies",
          "Blood pressure monitors",
          "Incontinence products",
          "Wound care supplies",
          "Orthopedic supports",
          "Feeding pumps and supplies",
          "Communication devices"
        ]
      }
    ],

    services: [
      {
        name: "Free In-Home Assessment",
        description: "Professional evaluation to determine equipment needs",
        features: [
          "Home safety evaluation",
          "Equipment recommendations",
          "Insurance verification",
          "Cost estimates"
        ]
      },
      {
        name: "Delivery & Setup",
        description: "White-glove delivery and professional installation",
        features: [
          "Same-day delivery available",
          "Professional setup and assembly",
          "Patient/caregiver training",
          "Safety inspection"
        ]
      },
      {
        name: "Maintenance & Repair",
        description: "Ongoing service and support for all equipment",
        features: [
          "24/7 emergency repairs",
          "Preventive maintenance",
          "Loaner equipment available",
          "Annual safety checks"
        ]
      }
    ],

    rental: {
      shortTerm: "Daily and weekly rentals for temporary needs",
      longTerm: "Monthly rentals with rent-to-own options",
      tryBeforeBuy: "7-day trial period on select equipment",
      insurance: "Insurance billing handled directly"
    },

    benefits: [
      {
        title: "Enhanced Independence",
        description: "Maintain autonomy with proper equipment",
        icon: Award
      },
      {
        title: "Improved Safety",
        description: "Reduce fall risks and prevent injuries",
        icon: Shield
      },
      {
        title: "Better Quality of Life",
        description: "Increase comfort and mobility at home",
        icon: Heart
      },
      {
        title: "Expert Support",
        description: "Certified technicians and therapist consultations",
        icon: Wrench
      }
    ],

    insurance: {
      medicare: "Medicare Part B covers 80% of approved DME",
      medicaid: "Full coverage for eligible recipients",
      private: "Most insurance plans cover DME with prescription",
      veterans: "VA benefits cover medical equipment",
      note: "Deductibles and co-pays may apply"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600 text-white">
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
                <Monitor className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {serviceDetails.name}
                </h1>
                <p className="text-xl text-gray-200">
                  {serviceDetails.category}
                </p>
              </div>
            </div>
            
            <p className="text-lg text-gray-100 mb-6 max-w-3xl">
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
                <Truck className="mr-1 h-4 w-4" />
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
              <Button size="lg" className="bg-white text-gray-700 hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Get Equipment Quote
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
        <Tabs defaultValue="equipment" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="equipment" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Equipment
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="rental" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Rental Options
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Benefits
            </TabsTrigger>
            <TabsTrigger value="insurance" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Insurance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Medical Equipment Catalog
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {serviceDetails.equipment.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
                      <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {category.category === "Mobility Equipment" && <Accessibility className="h-5 w-5" />}
                        {category.category === "Bedroom & Bathroom" && <BedDouble className="h-5 w-5" />}
                        {category.category === "Respiratory Equipment" && <Wind className="h-5 w-5" />}
                        {category.category === "Daily Living Aids" && <Heart className="h-5 w-5" />}
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

            {/* Popular Equipment Icons */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle>Most Requested Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Accessibility className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-center">Wheelchairs</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <BedDouble className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-center">Hospital Beds</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Wind className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-center">Oxygen Systems</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-center">Walkers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Professional DME Services
            </h2>
            
            <div className="space-y-6">
              {serviceDetails.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
                      <CardTitle className="text-xl text-gray-700 dark:text-gray-300">
                        {service.name}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {service.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Service Process */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle>Our Service Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">1. Contact Us</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Home className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">2. Assessment</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium">3. Delivery</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Wrench className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="text-sm font-medium">4. Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rental" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Flexible Rental Options
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle>Short-Term Rentals</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {serviceDetails.rental.shortTerm}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Post-surgery recovery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Travel and vacation needs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Temporary mobility issues</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Trial before purchase</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardTitle>Long-Term Rentals</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {serviceDetails.rental.longTerm}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Chronic conditions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Extended recovery periods</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Rent-to-own programs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Insurance coverage available</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Try Before You Buy Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {serviceDetails.rental.tryBeforeBuy}
                </p>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Special Offer: Apply 50% of your first week's rental toward purchase price!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Benefits of Professional DME Services
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
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                          <benefit.icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
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

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle>Why Choose Professional DME Providers?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>FDA-approved equipment only</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Stethoscope className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Certified respiratory therapists on staff</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Free delivery and setup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>24/7 emergency support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Insurance Coverage & Payment
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Medicare Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-semibold text-blue-600 mb-3">{serviceDetails.insurance.medicare}</p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Doctor's prescription required</li>
                    <li>✓ Equipment must be medically necessary</li>
                    <li>✓ Supplier must be Medicare-approved</li>
                    <li>✓ Annual deductible applies</li>
                    <li>✓ 20% co-insurance after deductible</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Other Insurance Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="font-semibold text-green-600">Medicaid</p>
                    <p className="text-sm">{serviceDetails.insurance.medicaid}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">Private Insurance</p>
                    <p className="text-sm">{serviceDetails.insurance.private}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">Veterans Benefits</p>
                    <p className="text-sm">{serviceDetails.insurance.veterans}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Important Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {serviceDetails.insurance.note}
                </p>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    We handle all insurance paperwork and billing directly. Our team will verify your coverage and explain your benefits before delivery.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Get the Equipment You Need Today
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    Don't let equipment needs limit your independence. Contact us for a free consultation and insurance verification.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="bg-gray-700 hover:bg-gray-800 text-white">
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