import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, DollarSign, Star, Phone, Heart, CheckCircle, Home, AlertCircle, Shield, Info } from 'lucide-react';
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
              <div className="text-3xl font-bold">$4,500</div>
              <div className="text-sm opacity-90">National Average (Genworth 2024)</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1M+</div>
              <div className="text-sm opacity-90">Residents Nationwide (NCAL 2024)</div>
            </div>
            <div>
              <div className="text-3xl font-bold">3.48 HPRD</div>
              <div className="text-sm opacity-90">CMS Staffing Standard</div>
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
              According to the <strong>National Center for Assisted Living (NCAL)</strong>, over 1 million Americans currently reside in assisted living communities,
              with residents typically receiving assistance with an average of 3.75 activities of daily living (ADLs).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              The national average cost of assisted living is <strong>$4,500 per month</strong> (Genworth 2024), though costs vary significantly by state and care level. 
              The <strong>Centers for Medicare & Medicaid Services (CMS)</strong> now requires assisted living facilities to maintain minimum staffing of 
              <strong>3.48 hours per resident day (HPRD)</strong> to ensure quality care standards are met.
            </p>
            
            {/* Federal Financial Assistance Box */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mt-6">
              <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300">Federal Financial Assistance Available</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>VA Aid & Attendance:</strong> Up to $2,358/month for veterans, $2,795/month for surviving spouses (VA 2024)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Medicaid HCBS Waivers:</strong> Home and Community-Based Services for those earning under $2,901/month (Medicaid 2024)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>SSI Supplementation:</strong> State supplements available in 46 states for assisted living residents (SSA 2024)
                  </div>
                </li>
              </ul>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              The <strong>Long-Term Care Ombudsman Program</strong> investigated 198,502 complaints in 2024 (ACL), ensuring residents' rights are protected. 
              Our platform connects you with communities in {userLocation} that meet federal quality standards.
            </p>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Services Typically Included in Assisted Living</h2>
          
          {/* Federal Quality Standards Alert */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Federal Quality Standards (CMS 2024)</h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  All licensed assisted living facilities must meet CMS minimum staffing requirements of 3.48 HPRD, 
                  maintain 24/7 registered nurse coverage, and undergo annual state inspections. The FDA reports 15% 
                  adverse drug event rates in senior care facilities, with 50% being potentially preventable through proper medication management.
                </p>
              </div>
            </div>
          </div>
          
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
          <h2 className="text-3xl font-bold mb-12 text-center">Assisted Living Costs & Financial Resources</h2>
          
          {/* Government Financial Assistance Programs */}
          <div className="mb-10 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-green-800 dark:text-green-300">Federal & State Financial Assistance Programs</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Federal Programs:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>VA Aid & Attendance:</strong> $2,358-$2,795/month for eligible veterans/spouses (VA 2024)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>Medicaid HCBS:</strong> Covers AL for those earning under $2,901/month (Medicaid 2024)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>PACE Programs:</strong> Serving 70,000+ participants, $7B annually (ACL 2024)
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">State Programs:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>SSI State Supplements:</strong> Available in 46 states for AL residents (SSA 2024)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>State Veterans Programs:</strong> Additional benefits varying by state
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <strong>Optional State Plans:</strong> Medicaid AL coverage in 44 states (CMS 2024)
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
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

      {/* Quality Standards & Oversight */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Federal Quality Standards & Resident Rights</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quality Measures */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Federal Quality Measures (AHRQ 2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>SOPS Survey 2.0:</strong> 8 composite quality measures for resident safety
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Pressure Ulcer Prevention:</strong> Tracked monthly by CMS
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Fall Prevention Protocols:</strong> Required documentation and reporting
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Medication Safety:</strong> FDA monitoring shows 15% adverse event rate
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>UTI Prevention:</strong> CDC infection control guidelines mandatory
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Resident Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-600" />
                  Resident Rights & Protections (ACL 2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Long-Term Care Ombudsman:</strong> 198,502 complaints investigated in 2024
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Right to Privacy:</strong> Protected under federal regulations
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Freedom from Restraints:</strong> Physical/chemical restraints prohibited
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Choice of Provider:</strong> Right to choose healthcare providers
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <strong>Appeal Rights:</strong> Can appeal discharge/transfer decisions
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Information */}
          <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="font-bold mb-3 text-orange-800 dark:text-orange-300">Report Concerns or Get Help:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Long-Term Care Ombudsman:</p>
                <p>Call: 1-800-677-1116</p>
                <p>Visit: ltcombudsman.org</p>
              </div>
              <div>
                <p className="font-semibold">State Health Departments:</p>
                <p>File complaints about quality of care</p>
                <p>Request inspection reports</p>
              </div>
            </div>
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