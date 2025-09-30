import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Users, DollarSign, CheckCircle, XCircle, Info, 
  Heart, Utensils, Car, Calendar, Shield, Activity,
  Coffee, Music, BookOpen, Dumbbell, Phone, ArrowRight
} from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function IndependentLivingDetailPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const keyServices = [
    {
      id: 'housing',
      name: 'Maintenance-Free Living',
      icon: Home,
      color: 'text-blue-600',
      description: 'Private apartment or cottage with no home maintenance worries',
      details: [
        'All exterior maintenance included',
        'No lawn care or snow removal',
        'Emergency repairs handled 24/7',
        'Utilities often bundled'
      ],
      whyItMatters: 'Focus on enjoying life, not maintaining property'
    },
    {
      id: 'dining',
      name: 'Restaurant-Style Dining',
      icon: Utensils,
      color: 'text-orange-600',
      description: 'Professional chef-prepared meals with flexible dining options',
      details: [
        '1-3 meals daily included',
        'Restaurant-style dining room',
        'Private dining for guests',
        'Special dietary accommodations'
      ],
      whyItMatters: 'No grocery shopping, cooking, or cleanup required'
    },
    {
      id: 'social',
      name: 'Vibrant Social Life',
      icon: Users,
      color: 'text-purple-600',
      description: 'Daily activities, clubs, and social events with peers',
      details: [
        '200+ monthly activities typical',
        'Clubs for every interest',
        'Educational programs',
        'Holiday celebrations'
      ],
      whyItMatters: 'Combat isolation and stay mentally engaged'
    },
    {
      id: 'transportation',
      name: 'Scheduled Transportation',
      icon: Car,
      color: 'text-green-600',
      description: 'Regular shuttles for shopping, appointments, and outings',
      details: [
        'Medical appointment shuttles',
        'Weekly shopping trips',
        'Cultural and entertainment outings',
        'Airport transportation available'
      ],
      whyItMatters: 'Maintain independence without driving concerns'
    }
  ];

  const costBreakdown = [
    { 
      region: 'National Median', 
      monthly: '$3,065-3,145',
      notes: 'All-inclusive pricing typical'
    },
    { 
      region: 'Lowest Cost States', 
      monthly: '$1,282-2,400',
      notes: 'Mississippi, Arizona, Missouri'
    },
    { 
      region: 'Highest Cost States', 
      monthly: '$5,000-7,545',
      notes: 'Maine, Alaska, Connecticut'
    },
    { 
      region: 'Premium Communities', 
      monthly: '$6,000-10,000',
      notes: 'Resort-style with golf courses'
    }
  ];

  const whoItsFor = [
    {
      category: 'Perfect For',
      icon: CheckCircle,
      color: 'text-green-600',
      items: [
        'Active adults 55+ or 62+',
        'Those who can manage all daily activities independently',
        'Seniors wanting to downsize from home ownership',
        'People seeking social connections and activities',
        'Those wanting convenience without care needs'
      ]
    },
    {
      category: 'Not Suitable For',
      icon: XCircle,
      color: 'text-red-600',
      items: [
        'Those needing help with bathing, dressing, or medications',
        'People requiring medical supervision',
        'Individuals with memory care needs',
        'Those with severe mobility limitations',
        'Anyone needing 24-hour care assistance'
      ]
    }
  ];

  const vsAssistedLiving = [
    { 
      feature: 'Personal Care', 
      independent: 'Not provided', 
      assisted: 'Help with ADLs included' 
    },
    { 
      feature: 'Medication Management', 
      independent: 'Self-managed', 
      assisted: 'Staff administered' 
    },
    { 
      feature: 'Monthly Cost', 
      independent: '$3,065 average', 
      assisted: '$5,190+ average' 
    },
    { 
      feature: 'Staffing', 
      independent: 'Hospitality staff only', 
      assisted: '24-hour care staff' 
    },
    { 
      feature: 'Living Space', 
      independent: 'Full apartments/cottages', 
      assisted: 'Studio/1-bedroom typical' 
    }
  ];

  const questionsToAsk = [
    'What is included in the monthly fee vs. à la carte services?',
    'Is there a community fee or entrance fee required?',
    'How many meals are included, and can I cook in my apartment?',
    'What happens if my care needs change in the future?',
    'Are pets allowed, and what are the restrictions?',
    'How far in advance must I reserve transportation?',
    'What are the guest policies for overnight visitors?',
    'Is there a minimum age requirement (55+ or 62+)?',
    'How active is the social calendar, and who plans activities?',
    'What are the contract terms and cancellation policies?'
  ];

  const financialConsiderations = [
    {
      title: 'Not Covered by Insurance',
      icon: XCircle,
      color: 'bg-red-50 border-red-200',
      points: [
        'Medicare does NOT cover independent living',
        'Medicaid does NOT cover independent living',
        'Considered housing, not medical care',
        'Private pay only (no government assistance)'
      ]
    },
    {
      title: 'Payment Methods',
      icon: DollarSign,
      color: 'bg-green-50 border-green-200',
      points: [
        'Social Security & pension income',
        'Retirement savings and 401(k)',
        'Home sale proceeds',
        'Long-term care insurance (rare)',
        'Family financial assistance'
      ]
    },
    {
      title: 'Budget Comparison',
      icon: Info,
      color: 'bg-blue-50 border-blue-200',
      points: [
        'Compare to: mortgage/rent + utilities',
        'Plus: groceries + dining out costs',
        'Plus: home maintenance + repairs',
        'Plus: transportation costs',
        'Often comparable or less expensive'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-white/20 text-white mb-4">
              Senior Living Resource Guide
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Independent Living Communities
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mb-8">
              Maintenance-free living for active seniors who want convenience, community, 
              and amenities without assistance with daily activities
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">55+</div>
                <div className="text-sm text-blue-100">Typical Age</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">$3,065</div>
                <div className="text-sm text-blue-100">Avg Monthly</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">No Care</div>
                <div className="text-sm text-blue-100">Provided</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">All-Inclusive</div>
                <div className="text-sm text-blue-100">Pricing</div>
              </div>
            </div>
            
            <Link to="/map-search?careType=independent">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Find Independent Living Near You
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* What is Independent Living */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Home className="h-6 w-6 text-blue-600" />
              What is Independent Living?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Independent Living communities are designed for active seniors (typically 55+ or 62+) who are 
              fully independent but want to enjoy a maintenance-free lifestyle with built-in social opportunities, 
              convenient services, and resort-style amenities. Think of it as apartment living specifically 
              designed for older adults, with the bonus of meals, activities, and transportation.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Key Point:</p>
              <p className="text-blue-800 dark:text-blue-300">
                Independent Living provides <strong>housing and lifestyle services</strong>, not medical care. 
                Residents must be able to manage all activities of daily living (ADLs) without assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Who It's For */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {whoItsFor.map((category) => (
            <Card key={category.category} className="border-2">
              <CardHeader>
                <CardTitle className={`text-xl flex items-center gap-2 ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <category.icon className={`h-4 w-4 mt-0.5 ${category.color}`} />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services & Amenities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Included Services & Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {keyServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedService === service.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                >
                  <div className="flex items-start gap-3">
                    <service.icon className={`h-8 w-8 ${service.color}`} />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{service.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {service.description}
                      </p>
                      {selectedService === service.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4"
                        >
                          <ul className="space-y-1 text-sm mb-3">
                            {service.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                              Why it matters: {service.whyItMatters}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Amenities */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Common Additional Amenities:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Dumbbell, name: 'Fitness Center' },
                  { icon: Coffee, name: 'Bistro/Cafe' },
                  { icon: BookOpen, name: 'Library' },
                  { icon: Music, name: 'Entertainment' }
                ].map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <amenity.icon className="h-4 w-4 text-gray-600" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Information */}
        <Card className="mb-8 border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              2024-2025 Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Region</th>
                    <th className="text-left py-2">Monthly Cost</th>
                    <th className="text-left py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {costBreakdown.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 font-semibold">{row.region}</td>
                      <td className="py-3 text-green-600 font-bold">{row.monthly}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Financial Considerations */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {financialConsiderations.map((section, idx) => (
            <Card key={idx} className={`border ${section.color}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.points.map((point, pidx) => (
                    <li key={pidx} className="text-sm flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Independent vs Assisted Living */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Independent Living vs. Assisted Living</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-left py-3 px-4">Independent Living</th>
                    <th className="text-left py-3 px-4">Assisted Living</th>
                  </tr>
                </thead>
                <tbody>
                  {vsAssistedLiving.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 px-4 font-semibold">{row.feature}</td>
                      <td className="py-3 px-4">{row.independent}</td>
                      <td className="py-3 px-4">{row.assisted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm">
                <strong className="text-yellow-900 dark:text-yellow-200">Important:</strong> Many communities offer 
                both levels of care, allowing residents to "age in place" and transition to assisted living 
                if needs change.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions to Ask */}
        <Card className="mb-8">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="h-6 w-6 text-blue-600" />
              Questions to Ask When Touring
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {questionsToAsk.map((question, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">{idx + 1}.</span>
                  <span className="text-gray-700 dark:text-gray-300">{question}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Explore Independent Living?</h2>
            <p className="mb-6 text-blue-100">
              Find and compare independent living communities in your area with transparent pricing and authentic reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/map-search?careType=independent">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Search Communities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/quiz">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Take Care Assessment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <p className="font-semibold">National Council on Aging</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Senior housing guidance and resources</p>
                </div>
                <a href="tel:1-800-677-1116" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">1-800-677-1116</span>
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <p className="font-semibold">Eldercare Locator</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Free service to find local resources</p>
                </div>
                <span className="text-sm text-gray-600">eldercare.acl.gov</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}