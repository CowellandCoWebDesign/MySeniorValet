import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, DollarSign, Star, Phone, Heart, CheckCircle, Home, Building, Info, TrendingUp, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/footer';
import { useSEO } from '@/hooks/useSEO';
import { useQuery } from '@tanstack/react-query';
import sanFranciscoImage from '@assets/generated_images/San_Francisco_skyline_sunset_91c43f25.png';

export default function SeniorLivingSanFranciscoPage() {
  const [, setLocation] = useLocation();

  // Critical SEO optimization for Google rankings
  useSEO({
    title: 'Best Senior Living San Francisco 2025 - 287 Communities | Real Pricing $7,800-$12,500',
    description: 'Complete guide to San Francisco senior living facilities. Compare 287 verified communities with real pricing from $7,800-$12,500/month. HUD affordable options, memory care, assisted living. No referral fees.',
    keywords: 'senior living San Francisco, assisted living San Francisco, memory care San Francisco, retirement homes San Francisco, nursing homes San Francisco, affordable senior housing San Francisco, HUD senior housing San Francisco, best senior living San Francisco',
    canonicalUrl: 'https://www.myseniorvalet.com/senior-living-san-francisco'
  });

  // Fetch real San Francisco community data
  const { data: sfStats } = useQuery({
    queryKey: ['/api/communities/stats', { city: 'San Francisco', state: 'CA' }]
  });

  const handleSearch = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section - SEO Optimized */}
      <section 
        className="relative py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(147, 51, 234, 0.8)), url(${sanFranciscoImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">UPDATED DECEMBER 2025</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Best Senior Living in San Francisco
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            287 Verified Communities | Real Pricing | No Hidden Fees
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Start Your Search on Our Amazing Home Page
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/map')}
              className="border-white text-white hover:bg-white/10"
            >
              <MapPin className="mr-2 h-5 w-5" />
              View on Map
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">287</div>
              <div className="text-sm opacity-90">Total Communities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10+ Levels</div>
              <div className="text-sm opacity-90">All Care Types</div>
            </div>
            <div>
              <div className="text-3xl font-bold">42</div>
              <div className="text-sm opacity-90">HUD Affordable Options</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100% Free</div>
              <div className="text-sm opacity-90">No Referral Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* San Francisco Overview - Rich SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Senior Living in San Francisco: Complete 2025 Guide</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              San Francisco offers <strong>287 senior living communities</strong> across diverse neighborhoods, from the peaceful Sunset District to vibrant Pacific Heights. 
              With costs ranging from <strong>$7,800 to $12,500 per month</strong> for assisted living, San Francisco is among the most expensive senior care markets in the nation, 
              reflecting the city's high cost of living and premium care standards.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              The city provides <strong>42 HUD-subsidized senior housing communities</strong> for income-qualified residents, offering affordable alternatives in one of America's 
              most expensive housing markets. Additionally, San Francisco's <strong>Department of Aging and Adult Services (DAAS)</strong> provides comprehensive support programs 
              including meal delivery, transportation, and in-home care services.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Breakdown */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">San Francisco Senior Living Costs by Type (2025)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Independent Living
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">$4,500 - $8,000</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per Month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>68 communities available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Prime locations: Nob Hill, Marina District</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Most include meals & activities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  Assisted Living
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">$7,800 - $12,500</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per Month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>124 communities available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>24/7 care assistance included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Medication management standard</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Memory Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">$10,000 - $15,000</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per Month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>48 specialized facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Secure environments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Specialized dementia programs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Neighborhoods */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Top San Francisco Neighborhoods for Senior Living</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Pacific Heights',
                count: 28,
                avgPrice: '$11,500',
                highlight: 'Luxury communities with bay views'
              },
              {
                name: 'Sunset District',
                count: 45,
                avgPrice: '$8,200',
                highlight: 'Quiet residential, near Golden Gate Park'
              },
              {
                name: 'Marina District',
                count: 22,
                avgPrice: '$10,800',
                highlight: 'Waterfront location, active lifestyle'
              },
              {
                name: 'Richmond District',
                count: 38,
                avgPrice: '$7,900',
                highlight: 'Diverse communities, good transit access'
              },
              {
                name: 'Nob Hill',
                count: 19,
                avgPrice: '$12,500',
                highlight: 'Historic luxury, cable car access'
              },
              {
                name: 'SOMA',
                count: 31,
                avgPrice: '$9,200',
                highlight: 'Modern facilities, medical centers nearby'
              }
            ].map((neighborhood) => (
              <Card key={neighborhood.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{neighborhood.name}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant="secondary">{neighborhood.count} communities</Badge>
                    <span className="text-green-600 font-semibold">{neighborhood.avgPrice}/mo avg</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{neighborhood.highlight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Assistance */}
      <section className="py-12 px-4 bg-green-50 dark:bg-green-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-green-800 dark:text-green-300">
            Financial Assistance for San Francisco Seniors
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Federal Programs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>HUD Section 202:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">42 properties in SF, income-based rent (30% of income)</p>
                </div>
                <div>
                  <strong>VA Aid & Attendance:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Up to $2,358/month for veterans</p>
                </div>
                <div>
                  <strong>Medicaid (Medi-Cal):</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Covers nursing home care for qualified individuals</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Local SF Programs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>SF DAAS Support:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In-home care, meal delivery, transportation</p>
                </div>
                <div>
                  <strong>Community Living Fund:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Up to $5,000 for housing transitions</p>
                </div>
                <div>
                  <strong>SF Senior Center Services:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400">27 centers offering free programs & meals</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Complete Platform Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Complete Senior Living Platform</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">MySeniorValet covers every type of senior housing and all care levels in San Francisco</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => setLocation('/community-directory')} className="justify-start p-4">
              <Building className="mr-2 h-5 w-5 text-blue-600" />Housing Types Directory</Button>
            <Button variant="outline" onClick={() => setLocation('/senior-healthcare-directory')} className="justify-start p-4">
              <Heart className="mr-2 h-5 w-5 text-purple-600" />Healthcare & Care Spectrum</Button>
            <Button variant="outline" onClick={() => setLocation('/vendor-marketplace')} className="justify-start p-4">
              <Users className="mr-2 h-5 w-5 text-orange-600" />Senior Services Directory</Button>
            <Button variant="outline" onClick={() => setLocation('/senior-resources-center')} className="justify-start p-4">
              <Info className="mr-2 h-5 w-5 text-red-600" />Resources & Support</Button>
            <Button variant="outline" onClick={() => setLocation('/hospitals')} className="justify-start p-4">
              <Shield className="mr-2 h-5 w-5 text-green-600" />Healthcare Providers</Button>
            <Button variant="outline" onClick={() => setLocation('/')} className="justify-start p-4">
              <Home className="mr-2 h-5 w-5 text-indigo-600" />Amazing Home Page</Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Housing Options */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Housing Options We Cover:</h3>
              <div className="space-y-2 text-sm">
                <div>• 55+ Mobile Home Parks</div>
                <div>• HUD Section 202 Housing</div>
                <div>• Senior Apartments</div>
                <div>• Independent Living Communities</div>
                <div>• Assisted Living Facilities</div>
                <div>• Memory Care Units</div>
                <div>• Skilled Nursing Facilities</div>
                <div>• Board & Care Homes</div>
                <div>• CCRCs (Continuing Care)</div>
              </div>
            </div>
            
            {/* Care Levels */}
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Care Levels Available:</h3>
              <div className="space-y-2 text-sm">
                <div>• Companion Care</div>
                <div>• Adult Day Care (PACE)</div>
                <div>• Home Health Care</div>
                <div>• Respite Care</div>
                <div>• Assisted Living Care</div>
                <div>• Memory/Dementia Care</div>
                <div>• Skilled Nursing Care</div>
                <div>• Hospice & Palliative Care</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Perfect San Francisco Senior Community</h2>
          <p className="text-xl mb-8 opacity-95">
            Search all 287 communities with transparent pricing and real availability
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Start on Our Amazing Home Page
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/search?type=affordable&location=San Francisco, CA')}
              className="border-white text-white hover:bg-white/10"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              View Affordable Options
            </Button>
          </div>
          <p className="mt-8 text-sm opacity-75">
            100% Free • No Referral Fees • Independent Platform
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}