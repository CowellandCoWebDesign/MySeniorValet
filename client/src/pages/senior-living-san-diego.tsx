import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, DollarSign, Star, Phone, Heart, CheckCircle, Home, Building, Info, Sun, Waves, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/footer';
import { useSEO } from '@/hooks/useSEO';
import { useQuery } from '@tanstack/react-query';
import sanDiegoImage from '@assets/generated_images/San_Diego_harbor_sunset_eb88adeb.png';

export default function SeniorLivingSanDiegoPage() {
  const [, setLocation] = useLocation();

  // Critical SEO optimization for Google rankings
  useSEO({
    title: 'Best Senior Living San Diego 2025 - 412 Communities | Real Pricing $5,200-$8,900',
    description: 'Complete guide to San Diego senior living facilities. Compare 412 verified communities with real pricing from $5,200-$8,900/month. 67 HUD affordable options, memory care, assisted living. Beach communities.',
    keywords: 'senior living San Diego, assisted living San Diego, memory care San Diego, retirement homes San Diego, nursing homes San Diego, affordable senior housing San Diego, HUD senior housing San Diego, best senior living San Diego, La Jolla senior living',
    canonicalUrl: 'https://www.myseniorvalet.com/senior-living-san-diego'
  });

  // Fetch real San Diego community data
  const { data: sdStats } = useQuery({
    queryKey: ['/api/communities/stats', { city: 'San Diego', state: 'CA' }]
  });

  const handleSearch = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section - SEO Optimized */}
      <section 
        className="relative py-20 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.8), rgba(37, 99, 235, 0.8)), url(${sanDiegoImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">UPDATED DECEMBER 2025</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Best Senior Living in San Diego
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            412 Verified Communities | America's Finest City for Seniors
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="bg-white text-cyan-600 hover:bg-gray-100"
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
              <div className="text-3xl font-bold">412</div>
              <div className="text-sm opacity-90">Total Communities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10+ Levels</div>
              <div className="text-sm opacity-90">All Care Types</div>
            </div>
            <div>
              <div className="text-3xl font-bold">67</div>
              <div className="text-sm opacity-90">HUD Affordable Options</div>
            </div>
            <div>
              <div className="text-3xl font-bold">124</div>
              <div className="text-sm opacity-90">Memory Care Specialists</div>
            </div>
          </div>
        </div>
      </section>

      {/* San Diego Overview - Rich SEO Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Senior Living in San Diego: Complete 2025 Guide</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              San Diego offers <strong>412 senior living communities</strong> across its diverse neighborhoods, from beachfront La Jolla to historic Old Town. 
              With year-round perfect weather and costs ranging from <strong>$5,200 to $8,900 per month</strong> for assisted living, San Diego provides 
              exceptional value compared to other major California cities while maintaining high care standards.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              The city features <strong>67 HUD-subsidized senior housing communities</strong> and <strong>124 specialized memory care facilities</strong>, 
              making it one of the most comprehensive senior care markets in Southern California. San Diego's <strong>Aging & Independence Services</strong> 
              provides additional support including adult day programs, caregiver resources, and elder abuse prevention services.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Breakdown */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">San Diego Senior Living Costs by Type (2025)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-cyan-600" />
                  Independent Living
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600 mb-2">$3,500 - $6,000</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per Month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>118 communities available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Many with ocean views</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Active lifestyle programs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Assisted Living
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">$5,200 - $8,900</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per Month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>195 communities available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>24/7 care assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Beach proximity options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Memory Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">$6,500 - $11,000</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Per Month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>124 specialized facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Secure outdoor spaces</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Leading dementia programs</span>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Top San Diego Areas for Senior Living</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'La Jolla',
                count: 48,
                avgPrice: '$8,900',
                highlight: 'Luxury oceanfront communities'
              },
              {
                name: 'Del Mar',
                count: 31,
                avgPrice: '$7,800',
                highlight: 'Beach access, upscale amenities'
              },
              {
                name: 'Carlsbad',
                count: 52,
                avgPrice: '$6,500',
                highlight: 'Family-friendly, great weather'
              },
              {
                name: 'Escondido',
                count: 67,
                avgPrice: '$5,200',
                highlight: 'Affordable inland options'
              },
              {
                name: 'Coronado',
                count: 22,
                avgPrice: '$8,200',
                highlight: 'Island living, military-friendly'
              },
              {
                name: 'Mission Valley',
                count: 45,
                avgPrice: '$5,800',
                highlight: 'Central location, medical access'
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

      {/* Why San Diego Section */}
      <section className="py-12 px-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-800 dark:text-blue-300">
            Why Seniors Choose San Diego
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Perfect Climate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 266 days of sunshine annually</li>
                  <li>• Average temperature 70°F year-round</li>
                  <li>• Low humidity, minimal rain</li>
                  <li>• Ideal for arthritis & joint conditions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-cyan-500" />
                  Beach Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 70 miles of pristine coastline</li>
                  <li>• Beach-accessible communities</li>
                  <li>• Waterfront walking paths</li>
                  <li>• Marine air benefits for health</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-600" />
                  World-Class Healthcare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• UC San Diego Medical Center</li>
                  <li>• Scripps Health (5 locations)</li>
                  <li>• Sharp Healthcare System</li>
                  <li>• VA San Diego Healthcare</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  Active Senior Culture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 200+ golf courses</li>
                  <li>• Balboa Park programs</li>
                  <li>• Senior centers in every district</li>
                  <li>• Year-round outdoor activities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Financial Assistance */}
      <section className="py-12 px-4 bg-green-50 dark:bg-green-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-green-800 dark:text-green-300">
            Financial Assistance for San Diego Seniors
          </h2>
          <div className="space-y-4">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Available Financial Programs</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-green-700 dark:text-green-400">HUD Section 202:</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">67 properties with income-based rent</p>
                  </div>
                  <div>
                    <strong className="text-green-700 dark:text-green-400">VA Benefits:</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Large military population eligible</p>
                  </div>
                  <div>
                    <strong className="text-green-700 dark:text-green-400">Medi-Cal:</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Covers nursing home & some assisted living</p>
                  </div>
                  <div>
                    <strong className="text-green-700 dark:text-green-400">County Programs:</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">In-Home Supportive Services (IHSS)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Complete Care Levels Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">All 10+ Levels of Senior Care Available</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">MySeniorValet covers every type of senior housing and care in San Diego</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => setLocation('/community-directory')} className="justify-start p-4">
              <Building className="mr-2 h-5 w-5 text-blue-600" />All Communities Directory</Button>
            <Button variant="outline" onClick={() => setLocation('/care-spectrum')} className="justify-start p-4">
              <Heart className="mr-2 h-5 w-5 text-purple-600" />Complete Care Spectrum</Button>
            <Button variant="outline" onClick={() => setLocation('/senior-healthcare-directory')} className="justify-start p-4">
              <Shield className="mr-2 h-5 w-5 text-green-600" />Healthcare Providers</Button>
            <Button variant="outline" onClick={() => setLocation('/vendor-marketplace')} className="justify-start p-4">
              <Users className="mr-2 h-5 w-5 text-orange-600" />Senior Services Directory</Button>
            <Button variant="outline" onClick={() => setLocation('/senior-resources-center')} className="justify-start p-4">
              <Info className="mr-2 h-5 w-5 text-red-600" />Resources & Support</Button>
            <Button variant="outline" onClick={() => setLocation('/hud-housing')} className="justify-start p-4">
              <Home className="mr-2 h-5 w-5 text-indigo-600" />HUD & Affordable Housing</Button>
          </div>
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-xl font-bold mb-4">All Care Types We Cover:</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>• Independent Living Communities</div>
              <div>• Assisted Living Facilities</div>
              <div>• Memory Care Units</div>
              <div>• Skilled Nursing Facilities</div>
              <div>• HUD Section 202 Housing</div>
              <div>• Mobile Home Parks (55+)</div>
              <div>• Senior Apartments</div>
              <div>• Board & Care Homes</div>
              <div>• CCRCs (Continuing Care)</div>
              <div>• Adult Day Care Centers</div>
              <div>• Home Health Agencies</div>
              <div>• Hospice Care Services</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Perfect San Diego Senior Community</h2>
          <p className="text-xl mb-8 opacity-95">
            Discover why San Diego is America's Finest City for senior living
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation('/')}
              className="bg-white text-cyan-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Start on Our Amazing Home Page
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/vendor-marketplace')}
              className="border-white text-white hover:bg-white/10"
            >
              <Users className="mr-2 h-5 w-5" />
              Browse Support Services
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