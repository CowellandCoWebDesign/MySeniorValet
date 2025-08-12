import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { 
  Building2, Search, MapPin, Home, Users, DollarSign, Shield, 
  Star, Filter, Database, TrendingUp, BarChart3, Globe,
  ChevronRight, Clock, CheckCircle, Info, Heart
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function CommunityDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [, setLocation] = useLocation();

  // Fetch community stats
  const { data: communityCount } = useQuery({
    queryKey: ['/api/communities/count'],
  });

  const { data: hudCount } = useQuery({
    queryKey: ['/api/communities/hud-count'],
  });

  const { data: marketOverview } = useQuery({
    queryKey: ['/api/market/overview'],
  });

  const { data: trendingCommunities } = useQuery({
    queryKey: ['/api/communities/trending'],
  });

  const topStates = (marketOverview as any)?.marketTrends?.topStates || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationHeader />
      
      {/* Page Header */}
      <section className="px-4 py-12 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-white/20 text-white px-4 py-1 mb-4">
              <Database className="h-4 w-4 mr-2" />
              COMPLETE DATABASE ACCESS
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-4">
              Community Directory
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Access our complete database of {((communityCount as any)?.count || '34,181').toLocaleString()}+ senior living communities across the United States
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">34,181+</div>
                  <div className="text-xs text-blue-100">Total Communities</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">{((hudCount as any)?.total || '5,936').toLocaleString()}</div>
                  <div className="text-xs text-blue-100">HUD Properties</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-white">50</div>
                  <div className="text-xs text-blue-100">States Covered</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-300">Live</div>
                  <div className="text-xs text-blue-100">Real-Time Data</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 py-8 bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search communities by name, city, or zip code..."
                  className="pl-10 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 px-8"
              onClick={() => setLocation(`/search?q=${encodeURIComponent(searchTerm)}`)}
            >
              <Search className="mr-2 h-5 w-5" />
              Search Database
            </Button>
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Shield className="h-3 w-3 mr-1" />
              HUD Verified
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20">
              <DollarSign className="h-3 w-3 mr-1" />
              With Pricing
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <Star className="h-3 w-3 mr-1" />
              5-Star Rated
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20">
              <Home className="h-3 w-3 mr-1" />
              Memory Care
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/20">
              <Users className="h-3 w-3 mr-1" />
              Assisted Living
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Browse by State */}
            <Card className="lg:col-span-2 border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Browse by State
                </CardTitle>
                <CardDescription>
                  Select a state to explore communities in that region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {topStates.slice(0, 15).map((state: any) => (
                    <Link key={state.state} href={`/search?state=${state.state}`}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-blue-400 group">
                        <CardContent className="p-3 text-center">
                          <div className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600">
                            {state.state}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {state.count.toLocaleString()} communities
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  <Link href="/search">
                    <Card className="hover:shadow-lg transition-all cursor-pointer border hover:border-blue-400 group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <CardContent className="p-3 text-center flex flex-col justify-center h-full">
                        <div className="font-bold text-sm text-blue-600">
                          View All 50 States
                        </div>
                        <ChevronRight className="h-4 w-4 mx-auto mt-1 text-blue-600" />
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Database Features */}
            <Card className="border-2 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-purple-600" />
                  Database Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Real-Time Updates</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Live pricing and availability
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">HUD Verified Pricing</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      5,936+ government properties
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Advanced Filtering</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Search by care type, price, location
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Complete Details</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Photos, amenities, reviews
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  onClick={() => setLocation('/search')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Start Searching
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trending Communities */}
          <Card className="mt-8 border-2 border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Trending Communities
              </CardTitle>
              <CardDescription>
                Most viewed communities in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(trendingCommunities as any[])?.slice(0, 6).map((community) => (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm group-hover:text-blue-600 line-clamp-1">
                            {community.name}
                          </h4>
                          {community.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-semibold">{community.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-3 w-3" />
                          {community.city}, {community.state}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {community.careTypes?.slice(0, 2).map((type: string) => (
                            <Badge key={type} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        {community.pricing && (
                          <div className="mt-2 text-sm font-semibold text-green-600">
                            From ${community.pricing}/mo
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/map')}>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">Interactive Map</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore communities visually on our interactive map
                </p>
                <Button variant="ghost" className="mt-4">
                  Open Map View
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/costs')}>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">Cost Calculator</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estimate and compare senior living costs
                </p>
                <Button variant="ghost" className="mt-4">
                  Calculate Costs
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setLocation('/ai-matching-assistant')}>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2">AI Matching</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get personalized community recommendations
                </p>
                <Button variant="ghost" className="mt-4">
                  Get Matched
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">About Our Database</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Our comprehensive database includes all licensed senior living communities across the United States, 
                    featuring real-time pricing, availability updates, and verified government data. We maintain strict 
                    data integrity standards to ensure you have access to the most accurate and up-to-date information.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Daily Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Government Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>No Hidden Fees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>100% Free Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}