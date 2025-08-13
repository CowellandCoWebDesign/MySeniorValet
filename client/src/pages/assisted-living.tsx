import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, DollarSign, Star, Phone, Heart, CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/Footer';
import { useSEO } from '@/hooks/useSEO';
import { useQuery } from '@tanstack/react-query';

export default function AssistedLivingPage() {
  const [, setLocation] = useLocation();
  const [userLocation, setUserLocation] = useState<string>('your area');

  // Set SEO for this high-value landing page
  useSEO({
    title: 'Assisted Living Near Me - Compare Costs & Availability | 12,000+ Communities',
    description: 'Find assisted living facilities near you. Compare real prices from $2,000-$8,000/month. See current availability, care services, and reviews for 12,000+ communities nationwide. No hidden fees or referral markups.',
    keywords: 'assisted living near me, assisted living costs, assisted living facilities, senior assisted living, memory care assisted living, assisted living prices, affordable assisted living, best assisted living',
    canonicalUrl: 'https://www.myseniorvalet.com/assisted-living'
  });

  // Get user's location for personalization
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In production, would reverse geocode to get city name
          setUserLocation('your area');
        },
        () => {
          setUserLocation('your area');
        }
      );
    }
  }, []);

  // Fetch assisted living stats
  const { data: stats } = useQuery({
    queryKey: ['/api/communities/stats', { careType: 'Assisted Living' }]
  });

  const handleSearch = () => {
    setLocation('/map-search?careTypes=Assisted Living');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section - Optimized for SEO */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Assisted Living Near You
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            Compare 12,000+ assisted living communities with real pricing and availability
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Assisted Living Near Me
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/care-spectrum')}
              className="border-white text-white hover:bg-white/10"
            >
              Learn About Care Levels
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">12,847</div>
              <div className="text-sm opacity-90">Assisted Living Communities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$2k-$8k</div>
              <div className="text-sm opacity-90">Monthly Price Range</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50</div>
              <div className="text-sm opacity-90">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm opacity-90">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Assisted Living - SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">What is Assisted Living?</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Assisted living facilities provide housing, meals, and personal care support for seniors who need help with daily activities but don't require skilled nursing care. 
              Residents typically live in private or semi-private apartments and receive assistance with medication management, bathing, dressing, and other activities of daily living (ADLs).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              The average cost of assisted living in the United States ranges from $2,000 to $8,000 per month, depending on location, 
              level of care needed, and amenities offered. Our platform helps you compare real prices from communities in {userLocation}, 
              with no hidden fees or referral markups that typically add 15-30% to your costs.
            </p>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Services Typically Included in Assisted Living</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Personal Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Bathing and grooming assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Dressing and personal hygiene</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Medication management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Mobility assistance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-blue-500" />
                  Living Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Three meals daily</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Housekeeping and laundry</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Transportation services</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>24-hour staff availability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Social & Wellness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Social activities and events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Exercise and fitness programs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Educational opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                    <span>Spiritual services</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Assisted Living Costs by State</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { state: 'California', avgCost: '$5,500', range: '$3,000 - $9,000' },
              { state: 'Florida', avgCost: '$4,000', range: '$2,500 - $6,500' },
              { state: 'Texas', avgCost: '$4,200', range: '$2,800 - $6,800' },
              { state: 'New York', avgCost: '$5,800', range: '$3,500 - $10,000' },
              { state: 'Arizona', avgCost: '$4,500', range: '$3,000 - $7,000' },
              { state: 'Illinois', avgCost: '$4,800', range: '$3,200 - $7,500' }
            ].map((state) => (
              <Card key={state.state} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/map-search?state=${state.state}&careTypes=Assisted Living`)}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{state.state}</h3>
                    <Badge variant="secondary">
                      <DollarSign className="h-3 w-3" />
                      {state.avgCost}/mo
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Price Range: {state.range}
                  </p>
                  <Button variant="link" className="p-0 mt-2">
                    Search {state.state} Communities →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your Assisted Living Search Today
          </h2>
          <p className="text-xl mb-8 opacity-95">
            No hidden fees. No referral markups. Just honest information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Communities Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/contact')}
              className="border-white text-white hover:bg-white/10"
            >
              <Phone className="mr-2 h-5 w-5" />
              Get Help Choosing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}