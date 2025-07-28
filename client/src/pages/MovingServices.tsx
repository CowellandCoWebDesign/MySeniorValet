import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Shield, Star, Phone, Globe, Users, CheckCircle, Calculator, Calendar } from 'lucide-react';

const MovingServices = () => {
  const handleContactTwoMen = () => {
    window.open('https://twomenandatruck.com/', '_blank');
  };

  const handleGetQuote = () => {
    window.open('https://twomenandatruck.com/locations', '_blank');
  };

  const handleAmazonAffiliate = () => {
    window.open('https://amzn.to/4lUWCV4', '_blank');
  };

  const services = [
    {
      name: 'Local Moving Services',
      description: 'Professional local moving services with trained and background-checked movers. Full-service moving including packing, loading, transport, and unloading for senior living transitions.',
      priceRange: '$200 - $2,000',
      features: ['Professional Movers', 'Background Checked Staff', 'Full Insurance Coverage', 'Packing Materials', 'Furniture Protection', 'Senior Moving Specialists'],
      icon: <Truck className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Long Distance Moving',
      description: 'Long-distance and interstate moving services for seniors relocating to new states or regions. Comprehensive service with tracking and dedicated customer support.',
      priceRange: '$1,500 - $8,000',
      features: ['Interstate Licensed', 'GPS Tracking', 'Dedicated Move Coordinator', 'Storage Options', 'Full Insurance', 'White Glove Service Available'],
      icon: <Globe className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Professional Packing Services',
      description: 'Complete packing and unpacking services by trained professionals. Perfect for seniors who need assistance with the physical demands of packing belongings.',
      priceRange: '$35 - $65/hour',
      features: ['Professional Packers', 'Packing Materials Included', 'Fragile Item Specialists', 'Unpacking Services', 'Room Organization'],
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Senior Moving Consultation',
      description: 'Specialized consultation service for senior moving needs including downsizing, estate cleanout, and transition planning to senior living communities.',
      priceRange: '$100 - $200',
      features: ['Senior Moving Specialist', 'Downsizing Planning', 'Community Liaison', 'Timeline Development', 'Stress-Reduction Strategies'],
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Storage Solutions',
      description: 'Flexible storage options including portable units, warehouse storage, and vaulted storage for seniors transitioning between homes or downsizing.',
      priceRange: '$59 - $299/month',
      features: ['Climate Controlled Options', 'Security Monitoring', 'Easy Access', 'Portable Units Available', 'Inventory Management'],
      icon: <Shield className="w-6 h-6" />,
      color: 'from-teal-500 to-teal-600'
    },
    {
      name: 'Junk Removal & Cleanout',
      description: 'Professional junk removal and estate cleanout services perfect for downsizing seniors or clearing properties before moves.',
      priceRange: '$150 - $1,500',
      features: ['Full Service Removal', 'Donation Coordination', 'Eco-Friendly Disposal', 'Estate Cleanout', 'Same Day Service Available'],
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="https://twomenandatruck.com/sites/default/files/logo.png" 
                alt="Two Men and a Truck Logo"
                className="h-12 w-auto bg-white p-2 rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'%3E%3Crect width='100' height='40' fill='%23ffffff'/%3E%3Ctext x='50' y='25' font-family='Arial' font-size='12' fill='%23333' text-anchor='middle'%3ETWO MEN AND A TRUCK%3C/text%3E%3C/svg%3E";
                }}
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">TWO MEN AND A TRUCK</h1>
                <p className="text-xl text-blue-100 mt-2">Professional Moving Services for Seniors</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
                <Star className="w-8 h-8 text-yellow-300" />
                <div>
                  <div className="text-2xl font-bold">96%</div>
                  <div className="text-sm text-blue-100">Customer Referral Rate</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
                <Truck className="w-8 h-8 text-green-300" />
                <div>
                  <div className="text-2xl font-bold">400+</div>
                  <div className="text-sm text-blue-100">Locations Worldwide</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
                <Clock className="w-8 h-8 text-orange-300" />
                <div>
                  <div className="text-2xl font-bold">40+</div>
                  <div className="text-sm text-blue-100">Years Experience</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
                onClick={handleGetQuote}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Get Free Quote
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-3 text-lg"
                onClick={handleContactTwoMen}
              >
                <Phone className="w-5 h-5 mr-2" />
                1-800-345-1070
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Moving Solutions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Tailored services for senior living transitions</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              VERIFIED NATIONAL PROVIDER
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{service.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{service.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price Range</span>
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
                  onClick={handleGetQuote}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Choose TWO MEN AND A TRUCK?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Trusted by millions of families nationwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Fully Licensed & Insured</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">US DOT 70441 licensed with comprehensive insurance coverage</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Background Checked Staff</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">All movers undergo thorough background checks and training</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Senior Specialists</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Specialized training for senior living transitions and downsizing</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">National Network</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">400+ locations across US, Canada, and UK for consistent service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amazon Associates Affiliate Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Moving Supplies from Amazon
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get professional-grade moving boxes and supplies delivered to your door. Amazon Prime eligible for fast, free shipping.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-orange-200 dark:border-orange-400 bg-white dark:bg-gray-800 shadow-xl">
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-yellow-200 dark:from-orange-900 dark:to-yellow-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">Amazon Moving Supplies</div>
                <div className="text-lg text-orange-600 dark:text-orange-300">Professional Moving Boxes</div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-orange-500 text-white text-sm px-3 py-1 font-bold animate-pulse">
                🚚 PRIME ELIGIBLE
              </Badge>
            </div>
          </div>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Professional Moving Box Sets
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Heavy-duty cardboard construction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Multiple size options available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Includes packing tape & bubble wrap</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Amazon Prime 2-day shipping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Easy returns policy</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-6 mb-6">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    $24.99 - $39.99
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    per box set • Prime eligible
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">4.8/5</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Over 10,000+ verified customer reviews
                  </p>
                </div>
                <Button 
                  onClick={handleAmazonAffiliate}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-3 font-semibold"
                >
                  Shop on Amazon
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  * MySeniorValet earns from qualifying Amazon purchases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Moving?</h2>
          <p className="text-xl text-blue-100 mb-8">Get your free quote today and experience the difference of professional moving services</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
              onClick={handleGetQuote}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Get Free Quote Online
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-3 text-lg"
              onClick={handleContactTwoMen}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call 1-800-345-1070
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-blue-100 text-sm">
              Available nationwide • Free estimates • Same-day service available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingServices;