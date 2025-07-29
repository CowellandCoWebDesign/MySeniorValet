import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Clock, Shield, Star, Phone, Globe, Users, CheckCircle, Heart, Smartphone } from 'lucide-react';
import { NavigationHeader } from "@/components/NavigationHeader";

const TransportationServices = () => {
  const handleContactGoGo = () => {
    window.open('https://www.gogograndparent.com/', '_blank');
  };

  const handleCallGoGo = () => {
    window.open('tel:1-855-464-6872', '_self');
  };

  const handleSignUp = () => {
    window.open('https://www.gogograndparent.com/membership-plans', '_blank');
  };

  const services = [
    {
      name: 'On-Demand Rideshare Transportation',
      description: 'Professional rideshare services through Uber and Lyft without needing a smartphone. Simply call our toll-free number for 24/7 transportation assistance with GoGoGuardian safety monitoring.',
      priceRange: '$16.99 - $499/month',
      features: ['No smartphone required', '24/7 availability', 'GoGoGuardian monitoring', 'Family notifications', 'Driver screening', 'Real-time tracking'],
      icon: <Car className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      highlighted: true
    },
    {
      name: 'Meal Delivery Service',
      description: 'Food delivery from restaurants through DoorDash, GrubHub, Postmates, and Uber Eats without needing apps. Order by phone with live operator assistance.',
      priceRange: '$16.99 - $499/month',
      features: ['No app required', 'Multiple restaurant partners', 'Live operator support', 'Real-time order tracking', 'Diet restriction support'],
      icon: <Heart className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Grocery Delivery Service',
      description: 'Grocery shopping and delivery through Instacart partnership. Call to place orders with assistance from live operators who can help with product selection.',
      priceRange: '$16.99 - $499/month',
      features: ['Instacart partnership', 'Live shopping assistance', 'Product selection help', 'Dietary preferences supported', 'Regular delivery scheduling'],
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Prescription Pickup & Delivery',
      description: 'Medication pickup and delivery services coordinated through our concierge team. Ensures seniors never miss important medications.',
      priceRange: '$16.99 - $499/month',
      features: ['Pharmacy coordination', 'Medication reminders', 'Insurance billing support', 'Regular prescription scheduling', 'Emergency medication delivery'],
      icon: <Shield className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Home Services Coordination',
      description: 'Professional coordination of handyman, housekeeping, lawn care, and other home maintenance services. All bookings handled by phone.',
      priceRange: '$16.99 - $499/month',
      features: ['Handyman services', 'Housekeeping coordination', 'Lawn care booking', 'Service provider screening', 'Quality assurance'],
      icon: <Users className="w-6 h-6" />,
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const membershipPlans = [
    {
      name: 'Basic',
      monthlyPrice: '$16.99',
      annualPrice: '$11.72/month',
      savings: '31% savings',
      features: ['All basic services', 'Phone booking', 'Basic support'],
      color: 'border-gray-300'
    },
    {
      name: 'Value',
      monthlyPrice: '$30-40',
      annualPrice: '$20-30/month',
      savings: 'Medium priority',
      features: ['Reduced service fees', 'Priority support', 'Enhanced monitoring'],
      color: 'border-blue-300'
    },
    {
      name: 'Premium',
      monthlyPrice: '$60-80',
      annualPrice: '$40-55/month',
      savings: 'High priority',
      features: ['Lowest service fees', 'Premium support', 'Advanced features'],
      color: 'border-purple-300'
    },
    {
      name: 'Total Care',
      monthlyPrice: '$499',
      annualPrice: '$409.99/month',
      savings: 'All inclusive',
      features: ['8 rides included', '4 grocery deliveries', 'Unlimited support'],
      color: 'border-green-300 bg-green-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader title="Transportation Services" />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">GoGo</div>
                  <div className="text-xs text-gray-600 font-semibold">Grandparent</div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">GoGoGrandparent</h1>
                <p className="text-xl text-blue-100 mt-2">Transportation & Services Without Smartphones</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
                <Smartphone className="w-8 h-8 text-green-300" />
                <div>
                  <div className="text-2xl font-bold">No App</div>
                  <div className="text-sm text-blue-100">Required</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
                <Clock className="w-8 h-8 text-yellow-300" />
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-blue-100">Availability</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
                <Globe className="w-8 h-8 text-purple-300" />
                <div>
                  <div className="text-2xl font-bold">50 States</div>
                  <div className="text-sm text-blue-100">+ Canada + Australia</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
                onClick={handleSignUp}
              >
                <Users className="w-5 h-5 mr-2" />
                View Membership Plans
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-3 text-lg"
                onClick={handleCallGoGo}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call (855) 464-6872
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Concierge Services</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">All services accessible by phone - no smartphone required</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              VERIFIED CONCIERGE SERVICE
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className={`hover:shadow-xl transition-all duration-300 border ${service.highlighted ? 'border-2 border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{service.name}</h3>
                {service.highlighted && (
                  <div className="mb-2">
                    <Badge className="bg-blue-500 text-white text-xs px-2 py-1">PRIMARY SERVICE</Badge>
                  </div>
                )}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{service.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Membership</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{service.priceRange}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Included Features:</div>
                  {service.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                  {service.features.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{service.features.length - 3} more features
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={handleCallGoGo}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call to Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Membership Plans */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Membership Plans</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Choose the plan that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipPlans.map((plan, index) => (
              <Card key={index} className={`hover:shadow-xl transition-all duration-300 border-2 ${plan.color}`}>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{plan.monthlyPrice}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{plan.annualPrice}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-semibold">{plan.savings}</div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    onClick={handleSignUp}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">How GoGoGrandparent Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Simple steps to get the help you need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Sign Up</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Register online or call (855) 464-6872 to choose your membership plan</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Call Anytime</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Dial (855) 464-6872 24/7 for rides, food, groceries, or home services</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">We Handle It</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Our team coordinates with service providers and monitors everything</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">4</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Stay Informed</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Family receives updates and notifications about all services</p>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Safety & Peace of Mind</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Comprehensive monitoring and family notifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">GoGoGuardian Monitoring</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time tracking and monitoring of all rides and services</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Family Notifications</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Automatic updates to family members about service usage</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Live operators available around the clock for assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of seniors who trust GoGoGrandparent for safe, reliable services</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
              onClick={handleSignUp}
            >
              <Users className="w-5 h-5 mr-2" />
              Sign Up Online
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-3 text-lg"
              onClick={handleCallGoGo}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call (855) 464-6872
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-lg">Transportation</div>
              <div className="text-blue-100 text-sm">(855) 464-6872</div>
            </div>
            <div>
              <div className="font-bold text-lg">Groceries</div>
              <div className="text-blue-100 text-sm">(855) 222-4919</div>
            </div>
            <div>
              <div className="font-bold text-lg">Meals</div>
              <div className="text-blue-100 text-sm">(855) 754-5328</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationServices;