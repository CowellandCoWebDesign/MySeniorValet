import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Heart, 
  Brain, 
  Shield, 
  DollarSign, 
  Clock, 
  Users, 
  Activity,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Link } from "wouter";

export default function CareGuide() {
  const careTypes = [
    {
      id: 'independent',
      title: 'Independent Living',
      icon: <Home className="w-8 h-8" />,
      description: 'For active seniors who want maintenance-free living with social opportunities',
      priceRange: '$2,500 - $5,500',
      gradient: 'from-green-500 to-emerald-600',
      features: [
        'Private apartments or condos',
        'Housekeeping and maintenance',
        'Community dining options',
        'Social activities and clubs',
        'Transportation services',
        'Fitness and wellness programs'
      ],
      idealFor: [
        'Active seniors (65+)',
        'Those who can live independently',
        'People seeking social engagement',
        'Individuals wanting maintenance-free living'
      ],
      services: [
        'Meal plans available',
        'Housekeeping services',
        'Transportation to appointments',
        'Social activities coordination',
        'Wellness programs',
        'Emergency response systems'
      ]
    },
    {
      id: 'assisted',
      title: 'Assisted Living',
      icon: <Heart className="w-8 h-8" />,
      description: 'For seniors who need help with daily activities but want to maintain independence',
      priceRange: '$3,500 - $7,500',
      gradient: 'from-blue-500 to-purple-600',
      features: [
        'Personal care assistance',
        'Medication management',
        'Daily living support',
        'Private or shared rooms',
        'Structured activities',
        '24/7 staff availability'
      ],
      idealFor: [
        'Seniors needing daily living help',
        'Those requiring medication management',
        'Individuals with mobility challenges',
        'People with mild cognitive changes'
      ],
      services: [
        'Bathing and grooming assistance',
        'Medication reminders',
        'Meal preparation and dining',
        'Mobility assistance',
        'Housekeeping and laundry',
        'Social and recreational activities'
      ]
    },
    {
      id: 'memory',
      title: 'Memory Care',
      icon: <Brain className="w-8 h-8" />,
      description: 'Specialized care for seniors with Alzheimer\'s, dementia, or other memory conditions',
      priceRange: '$4,500 - $9,500',
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'Secure, specialized environment',
        'Trained dementia care staff',
        'Structured daily routines',
        'Cognitive stimulation programs',
        'Family support services',
        'Specialized dining programs'
      ],
      idealFor: [
        'Individuals with Alzheimer\'s disease',
        'Those with dementia or memory loss',
        'Seniors with cognitive impairment',
        'Families needing specialized support'
      ],
      services: [
        'Specialized dementia care',
        'Cognitive therapy programs',
        'Behavioral management',
        'Family education and support',
        'Secure environment monitoring',
        'Personalized care plans'
      ]
    }
  ];

  const pricingFactors = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Location',
      description: 'Urban areas and coastal regions typically cost 20-40% more'
    },
    {
      icon: <Home className="w-5 h-5" />,
      title: 'Accommodation Type',
      description: 'Private rooms cost more than shared; larger units increase price'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Care Level',
      description: 'More intensive care services increase monthly costs'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'Amenities',
      description: 'Premium amenities like pools, spas, and concierge services add cost'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Senior Care Types & Pricing Guide</h1>
            <p className="text-xl text-blue-100">
              Understanding your options with transparent pricing insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Care Types Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {careTypes.map((care) => (
            <Card key={care.id} className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${care.gradient}`} />
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${care.gradient} flex items-center justify-center text-white mx-auto mb-4`}>
                  {care.icon}
                </div>
                <CardTitle className="text-2xl mb-2">{care.title}</CardTitle>
                <p className="text-gray-600">{care.description}</p>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-xl font-bold text-green-600">{care.priceRange}</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {care.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 text-blue-500 mr-2" />
                    Ideal For
                  </h4>
                  <ul className="space-y-2">
                    {care.idealFor.map((ideal, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{ideal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Intelligence Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span>MySeniorValet Pricing Intelligence</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">How We Calculate Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium">Government Data Sources</p>
                      <p className="text-sm text-gray-600">CMS Medicare cost reports and state health department data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium">Market Research</p>
                      <p className="text-sm text-gray-600">Regional cost analysis and comparable community pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <p className="font-medium">Real-Time Updates</p>
                      <p className="text-sm text-gray-600">Monthly pricing updates based on market conditions</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing Factors</h3>
                <div className="space-y-3">
                  {pricingFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {factor.icon}
                      </div>
                      <div>
                        <p className="font-medium">{factor.title}</p>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Pricing Examples */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Regional Pricing Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">San Francisco Bay Area</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Independent Living</span>
                    <span className="font-medium">$4,500-$8,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assisted Living</span>
                    <span className="font-medium">$6,500-$12,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Care</span>
                    <span className="font-medium">$8,500-$15,000</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">Austin, Texas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Independent Living</span>
                    <span className="font-medium">$2,800-$5,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assisted Living</span>
                    <span className="font-medium">$3,800-$6,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Care</span>
                    <span className="font-medium">$5,200-$8,500</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">Birmingham, Alabama</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Independent Living</span>
                    <span className="font-medium">$2,200-$4,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assisted Living</span>
                    <span className="font-medium">$3,200-$5,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Care</span>
                    <span className="font-medium">$4,500-$7,200</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <span>Important Considerations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">What's Usually Included</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Housing and utilities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Meals and dining</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Basic activities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Emergency response</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Additional Costs</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Personal care services</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Medical services</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Premium amenities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Transportation</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Find the Right Care?</h3>
          <p className="text-gray-600 mb-6">
            Search our 8,000+ communities with transparent pricing and detailed care information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                Search Communities
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="text-lg px-8 py-3">
                Get Help Choosing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}