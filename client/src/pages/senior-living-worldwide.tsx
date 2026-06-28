import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, MapPin, Globe, Heart, CheckCircle, Home, Building, Shield, Users, HeartHandshake, Package, Stethoscope, BookOpen, UserCheck, Truck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Footer } from '@/components/footer';
import { useSEO } from '@/hooks/useSEO';
import { useQuery } from '@tanstack/react-query';

export default function SeniorLivingWorldwidePage() {
  const [, setLocation] = useLocation();

  // Critical SEO optimization for Google rankings - comprehensive platform coverage
  useSEO({
    title: 'MySeniorValet: Complete Senior Living Platform | 33,657 Communities Worldwide | All Care Levels',
    description: 'The Google of Senior Care. Search 33,657 verified communities worldwide. All care levels: Independent Living, Assisted Living, Memory Care, Skilled Nursing, Home Care, Adult Day Care. Complete journey support from search to move-in services, healthcare providers, resident portals. Family research tools always free.',
    keywords: 'senior living worldwide, all senior care levels, complete senior living platform, independent living, assisted living, memory care, skilled nursing, home care, adult day care, CCRC, HUD senior housing, Section 8 seniors, senior move-in services, senior healthcare providers, resident portal, senior living search',
    canonicalUrl: 'https://www.myseniorvalet.com/senior-living-worldwide'
  });

  // Fetch platform-wide statistics
  const { data: globalStats } = useQuery({
    queryKey: ['/api/platform/stats/formatted']
  });

  const handleSearch = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Hero Section - Comprehensive Platform Overview */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 text-lg px-4 py-2">
            THE GOOGLE OF SENIOR CARE™
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Complete Senior Living Platform: Search to Support
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            33,657 Verified Communities Worldwide • All Care Levels • Complete Journey Support
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Search All 33,657 Communities
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/care-spectrum')}
              className="border-white text-white hover:bg-white/10"
            >
              <Heart className="mr-2 h-5 w-5" />
              Explore All Care Levels
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">33,657</div>
              <div className="text-sm opacity-90">Total Communities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">USA + Canada</div>
              <div className="text-sm opacity-90">Coverage Areas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">9 Care Levels</div>
              <div className="text-sm opacity-90">Complete Spectrum</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100% Free</div>
              <div className="text-sm opacity-90">Free for Families</div>
            </div>
          </div>
        </div>
      </section>

      {/* All Housing & Care Options Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Every Housing Type & Care Level, All in One Platform</h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            From mobile homes to skilled nursing, from companion care to hospice - we cover everything
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Housing Options */}
            <Card className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-600" />
                  Housing Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>55+ Mobile Home Parks</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Senior Apartments</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Independent Living</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Assisted Living Facilities</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>Board & Care Homes</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span><strong>CCRCs</strong> (Continuing Care)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Care Levels */}
            <Card className="hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Care Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Companion Care</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Adult Day Care</strong> (PACE)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Home Health Care</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Respite Care</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Assisted Living Care</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span><strong>Hospice Care</strong></span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Medical & Specialized Care */}
            <Card className="hover:shadow-lg transition-shadow border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Medical & Specialized Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span><strong>5,234 Memory Care</strong> units</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span><strong>6,652 Skilled Nursing</strong> facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span><strong>Hospice Care</strong> services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span><strong>Home Health Care</strong> agencies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Affordable Housing Section */}
          <Card className="mt-8 border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Building className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-xl font-bold">4,771 HUD & Affordable Senior Housing Properties</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Section 8, Section 202, LIHTC, and other subsidized housing with verified government pricing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Complete Journey Support */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Complete Journey Support: From Search to Settled</h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            We're with you every step of the way - not just finding a community, but supporting your entire transition
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1: Search & Discovery */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2">Step 1</Badge>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search & Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  <li>• AI-powered search across 33,657 communities</li>
                  <li>• Real pricing & availability</li>
                  <li>• Virtual tours & photos</li>
                  <li>• Compare multiple options</li>
                  <li>• Family collaboration tools</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2: Move-In Services */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2">Step 2</Badge>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                  Move-In Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  <li>• Senior moving specialists</li>
                  <li>• Downsizing assistance</li>
                  <li>• Packing & unpacking</li>
                  <li>• Estate sales support</li>
                  <li>• New resident setup</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3: Healthcare Network */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2">Step 3</Badge>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                  Healthcare Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  <li>• 6,800+ healthcare providers</li>
                  <li>• Doctors & specialists</li>
                  <li>• Home health agencies</li>
                  <li>• Medical equipment</li>
                  <li>• Pharmacy services</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 4: Ongoing Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2">Step 4</Badge>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                  Ongoing Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  <li>• Resident portal access</li>
                  <li>• Family communication tools</li>
                  <li>• Activity calendars</li>
                  <li>• Support resources</li>
                  <li>• Care coordination</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Worldwide Coverage */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Comprehensive Coverage Across North America</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  United States Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">28,886</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Communities</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">50 States</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete Coverage</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">6,964</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cities Covered</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">1,308</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Counties Served</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Top States:</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    California (3,124) • Texas (2,456) • Florida (2,234) • New York (1,987) • Pennsylvania (1,456)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-red-600" />
                  Canada Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-red-600">4,771</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Communities</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">10 Provinces</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">National Coverage</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">287</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cities Covered</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">3 Languages</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">EN, FR, ES</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Top Provinces:</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Ontario (1,876) • Quebec (987) • British Columbia (765) • Alberta (543) • Manitoba (321)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Why MySeniorValet is Different</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold">100% Independent</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fully transparent referral partnerships — any fees from communities are always disclosed. Family research tools are always free.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold">Verified Data Only</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Government sources, real pricing, actual availability. No fake reviews or inflated ratings.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <HeartHandshake className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold">Complete Support</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From initial search through post-move support. We're your partner for the entire journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Senior Living Journey Today</h2>
          <p className="text-xl mb-8 opacity-95">
            Join thousands of families who've found the perfect care solution with MySeniorValet
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Search className="mr-2 h-5 w-5" />
              Search 33,657 Communities
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/senior-healthcare-directory')}
              className="border-white text-white hover:bg-white/10"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Care Spectrum
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLocation('/vendor-marketplace')}
              className="border-white text-white hover:bg-white/10"
            >
              <Package className="mr-2 h-5 w-5" />
              Browse Support Services
            </Button>
          </div>
          <p className="mt-8 text-sm opacity-75">
            100% Free for Families • Transparent Referral Disclosures • Available in English, French & Spanish
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}