import React from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Globe, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';

interface VendorProfileProps {}

export default function VendorProfile({}: VendorProfileProps) {
  const { vendorId } = useParams();

  // For now, we'll focus on the 1-800-FLORALS vendor
  const vendor = {
    id: '1800florals',
    name: '1-800-FLORALS',
    description: 'Professional floral services specializing in move-in arrangements, special occasions, and monthly subscriptions for senior living communities.',
    verified: true,
    category: 'Floral Services',
    rating: 4.8,
    reviewCount: 2847,
    established: '1976',
    locations: 'Nationwide delivery',
    phone: '1-800-356-7257',
    website: 'https://www.1800florals.com',
    logo: 'https://www.800florals.com/img/4810Dmd.jpg', // FTD Graceful Grandeur 18 Roses
    heroImage: 'https://www.800florals.com/img/T2533md.jpg', // Your Light Shines Arrangement
    productImages: [
      {
        url: 'https://www.800florals.com/img/4810Dmd.jpg',
        name: 'FTD Graceful Grandeur 18 Roses Vase',
        price: '$149.95',
        code: '#4810D'
      },
      {
        url: 'https://www.800florals.com/img/T2533md.jpg',
        name: 'Your Light Shines Arrangement',
        price: '$134.95',
        code: '#T2533'
      },
      {
        url: 'https://www.800florals.com/img/T2671md.jpg',
        name: 'Love Everlasting Flowers Bouquet',
        price: '$124.95',
        code: '#T2671'
      },
      {
        url: 'https://www.800florals.com/img/4839Dmd.jpg',
        name: 'FTD Stunning Beauty Bouquet',
        price: '$109.95',
        code: '#4839D'
      }
    ],
    services: [
      'Move-in Welcome Arrangements',
      'Birthday & Anniversary Flowers',
      'Sympathy & Funeral Arrangements',
      'Monthly Subscription Service',
      'Same-Day Delivery',
      'Custom Corporate Arrangements'
    ],
    features: [
      'Same-day delivery available',
      'Fresh flower guarantee',
      'Professional arrangement design',
      'Senior community partnerships',
      'Volume discounts available',
      '24/7 customer service'
    ],
    pricing: {
      moveInSpecial: '$39.99',
      monthlySubscription: '$24.99/month',
      standardArrangement: '$29.99 - $199.99'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title={vendor.name} 
        subtitle="Verified vendor service provider"
      />

      {/* Immediate Call to Action Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">Ready to Order?</h3>
                <p className="text-pink-100">Click below to browse and order from 1-800-FLORALS professional catalog</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                className="bg-white text-pink-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
                onClick={() => window.open('https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals', '_blank')}
              >
                🌹 Shop 1-800-FLORALS Now →
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-pink-600 px-6 py-3"
                onClick={() => window.open('tel:1-800-356-7257')}
              >
                📞 Call: 1-800-FLORALS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 h-full flex items-center">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src={vendor.logo} 
                alt={vendor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  const nextElement = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="w-full h-full flex items-center justify-center hidden">
                <span className="text-4xl">🌸</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{vendor.name}</h1>
                <Badge className="bg-green-500 text-white">✓ VERIFIED</Badge>
                <Badge className="bg-pink-500 text-white">{vendor.category}</Badge>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{vendor.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{vendor.rating}</span>
                  <span>({vendor.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Est. {vendor.established}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.locations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Services & Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Available Services</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-900 dark:text-white">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Key Features</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vendor.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Products Gallery */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Arrangements</h2>
                <p className="text-gray-600 dark:text-gray-400">Popular selections from our authentic product catalog</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendor.productImages.map((product, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={product.url} 
                          alt={product.name}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open('https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals', '_blank')}
                          crossOrigin="anonymous"
                          loading="eager"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-pink-600 dark:text-pink-400">{product.price}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{product.code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integration with MySeniorValet */}
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <h2 className="text-xl font-bold text-green-800 dark:text-green-200">MySeniorValet Integration</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Direct integration with community move-in process</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Special pricing for MySeniorValet families</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Coordinated delivery to senior living communities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">Family notification and photo confirmations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Pricing */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contact Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{vendor.phone}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">24/7 Customer Service</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" 
                       className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      Visit Website
                    </a>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1800florals.com</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Special Pricing</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="font-semibold text-pink-800 dark:text-pink-200">Move-In Special</div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{vendor.pricing.moveInSpecial}</div>
                  <div className="text-sm text-pink-700 dark:text-pink-300">Welcome arrangement + delivery</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="font-semibold text-purple-800 dark:text-purple-200">Monthly Subscription</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{vendor.pricing.monthlySubscription}</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Fresh flowers delivered monthly</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">Custom Arrangements</div>
                  <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{vendor.pricing.standardArrangement}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Based on size and occasion</div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => window.open('https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals', '_blank')}
              >
                Order Flowers Now (1-800-FLORALS) →
              </Button>
              <Link href="/floral-services">
                <Button variant="outline" className="w-full">
                  Browse Full Catalog
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('tel:1-800-356-7257')}
              >
                Call: 1-800-FLORALS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Authentic 1-800-FLORALS Bottom Menu */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">1-800-FLORALS Complete Menu</h3>
            <p className="text-gray-300">Browse our full selection of professional floral services</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Flowers & Occasions */}
            <div>
              <h4 className="font-bold text-pink-400 mb-3">Flowers & Occasions</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Birthday Flowers</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Anniversary Bouquets</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Get Well Flowers</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Sympathy Flowers</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Thank You Gifts</a></li>
              </ul>
            </div>

            {/* Roses & Arrangements */}
            <div>
              <h4 className="font-bold text-pink-400 mb-3">Roses & Arrangements</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Send Roses Online</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Fresh Flower Arrangements</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">FTD Flowers</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Teleflora Bouquets</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Best Sellers</a></li>
              </ul>
            </div>

            {/* Plants & Gifts */}
            <div>
              <h4 className="font-bold text-pink-400 mb-3">Plants & Gifts</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Plant Gifts</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">New Baby Gifts</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Graduation Flowers</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Monthly Flowers</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Thinking of You</a></li>
              </ul>
            </div>

            {/* Services & Info */}
            <div>
              <h4 className="font-bold text-pink-400 mb-3">Services & Info</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Custom Orders</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Flower Meanings</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Delivery Information</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Free Reminders</a></li>
                <li><a href="https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals" target="_blank" className="text-gray-300 hover:text-white transition-colors">Virtual Flowers</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3"
                onClick={() => window.open('https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals', '_blank')}
              >
                🌹 Order Now from 1-800-FLORALS
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3"
                onClick={() => window.open('tel:1-800-356-7257')}
              >
                📞 Call 1-800-FLORALS
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Professional florist delivery • Same-day available • 95+ years experience • Nationwide coverage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}