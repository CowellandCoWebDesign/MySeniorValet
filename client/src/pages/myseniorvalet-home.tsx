import { useState, useEffect } from "react";
import { EnhancedCommunityCard } from "@/components/EnhancedCommunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home, Building2, DollarSign, Users, Info, MessageCircle, Link2, Truck, Sofa, Pill, Eye, Clock, Phone, Brain, Sparkles, Building, Ambulance, Package, CheckCircle, Stethoscope, Activity, ShieldCheck, Scale, Utensils, Car, Scissors, Users2, FileText, Calculator, ShoppingCart, Trash2, Flower, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PricingBreakdown } from "@/components/pricing-breakdown";
import { ThemeToggle } from "@/components/theme-toggle";




export default function MySeniorValetHome() {
  console.log("MYSENIORVALET HOME PAGE LOADED - VERSION 3 WITH CONCIERGE SERVICES PRIORITIZED - 26,306 COMMUNITIES");
  const [searchQuery, setSearchQuery] = useState("");

  const [showIntegrationSpotlight, setShowIntegrationSpotlight] = useState(true);
  
  // ONLY get cached community count - no need for full community list on homepage
  const { data: communityStats, isLoading } = useQuery({
    queryKey: ["/api/communities/count"],
    retry: false,
  });

  // Removed predictive search suggestions to improve performance

  const { data: heroImages } = useQuery({
    queryKey: ["/api/images/hero"],
    retry: false,
  });

  // Enhanced platform statistics for data-driven homepage
  const { data: platformStats } = useQuery({
    queryKey: ["/api/platform/stats"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Concierge service images for matching tropical theme
  const { data: conciergeImages } = useQuery({
    queryKey: ["/api/images/concierge-services"],
    retry: false,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  // Real-time market data
  const { data: marketData } = useQuery({
    queryKey: ["/api/market/overview"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // HUD properties with live pricing
  const { data: hudProperties, isLoading: hudLoading } = useQuery({
    queryKey: ["/api/communities/hud-featured"],
    retry: false,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fast-loading trending communities with diverse search examples
  const { data: trendingCommunities, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/communities/trending"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Location-specific queries for horizontal sections
  const { data: sacramentoCommunities, isLoading: sacramentoLoading } = useQuery({
    queryKey: ["/api/communities/by-location/Sacramento"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
  });

  // Coastal communities - search for actual coastal cities
  const { data: coastalCommunities, isLoading: coastalLoading } = useQuery({
    queryKey: ["/api/communities/coastal"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
  });

  // California communities - search for California-wide communities
  const { data: californiaCommunities, isLoading: californiaLoading } = useQuery({
    queryKey: ["/api/communities/by-location/California"],
    retry: false,
    staleTime: 0, // No cache - always fresh data
  });

  const featuredCommunities = (trendingCommunities as any[])?.slice(0, 8) || [];
  
  // Combine coastal and featured communities for the top section
  const premiumCommunities = [
    ...((coastalCommunities as any[]) || []).slice(0, 4),
    ...((featuredCommunities as any[]) || []).slice(0, 4)
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header - Reduced height */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/10 dark:bg-black/30 backdrop-blur-md border-b border-white/10 dark:border-white/20">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-lg">
                <div className="flex flex-col space-y-1">
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  <div className="w-4 h-0.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gradient dark:text-white">MySeniorValet</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link href="/login" className="text-white hover:text-amber-200 dark:text-gray-300 dark:hover:text-amber-300 transition-colors font-medium text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          <img
            src={heroImages?.url || "https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg"}
            alt={heroImages?.alt || "Beautiful senior living community with elegant architecture and landscaping"}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 dark:from-black/60 dark:via-black/70 dark:to-black/80"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center hero-content min-h-screen px-6 py-8 mobile-keyboard-safe">
          {/* Centered Headlines - Much Larger */}
          <div className="text-center mb-4 md:mb-6 max-w-6xl">
            <div className="space-y-4 mb-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white dark:text-gray-100 leading-tight drop-shadow-2xl animate-fade-in-up tracking-tight">
                <span className="block mb-2">Everything Senior Living Needs</span>
                <span className="block text-gradient bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-none">in one place</span>
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white dark:text-gray-200 opacity-95 drop-shadow-lg px-4 animate-fade-in-up animation-delay-300 max-w-5xl mx-auto font-medium leading-relaxed">
                From live pricing and unit availability to move coordination, furniture setup, and prescription delivery, MySeniorValet is your white-glove partner.
              </h2>
            </div>
          </div>
          


          {/* Search Bar - Wider */}
          <div className="w-full max-w-4xl mb-4 relative animate-fade-in-up animation-delay-600" style={{ zIndex: 99999 }}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!searchQuery) return;
              
              // Navigate to map-search with the query - let that page handle the AI search
              window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}`;
            }}>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Ask me anything: 'memory care near me', 'pet-friendly', 'under $3000'..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (searchQuery) {
                          window.location.href = `/map-search?q=${encodeURIComponent(searchQuery)}`;
                        }
                      }
                    }}
                    className="flex-1 px-6 py-4 text-base md:text-lg border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="flex items-center mr-2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs md:text-sm px-3 py-2">
                      AI-Powered
                    </Badge>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 m-2 rounded-2xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
            </form>
            

          </div>

          {/* Primary CTA - Larger */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3 animate-fade-in-up animation-delay-700">
            <Link href="/quiz">
              <Button variant="outline" className="border-2 border-purple-300 text-purple-100 hover:bg-purple-400 hover:text-purple-900 px-6 py-3 rounded-2xl font-medium text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-purple-500/20 backdrop-blur-sm">
                ✨ Find My Perfect Match
              </Button>
            </Link>
            <Link href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 rounded-2xl font-medium text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-white/10 backdrop-blur-sm">
                Explore Communities
              </Button>
            </Link>
          </div>

          {/* NEW AI Map Showcase Button */}
          <div className="mb-3 animate-fade-in-up animation-delay-800">
            <Link href="/ai-map-showcase">
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 text-base md:text-lg px-8 py-4 rounded-2xl flex items-center justify-center ring-4 ring-purple-300 ring-opacity-50 animate-slow-pulse"
              >
                <Brain className="mr-3 h-6 w-6" />
                <Sparkles className="mr-2 h-5 w-5" />
                <span className="font-bold">🚀 Experience AI-Powered Map Intelligence</span>
              </Button>
            </Link>
          </div>
          

          
          {/* Trust Indicators with 26,306+ Communities */}
          <div className="mb-3 animate-fade-in-up animation-delay-800">
            <div className="flex flex-wrap items-center justify-center gap-3">

              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg">
                <Building2 className="h-5 w-5 text-blue-300" />
                <span className="text-base md:text-lg font-semibold text-white">HUD + Government Sources</span>
              </div>

            </div>
          </div>
          
          {/* Community Count Text - Updated */}
          <div className="mb-2 animate-fade-in-up animation-delay-850">
            <p className="text-white/90 dark:text-gray-300 text-base md:text-lg lg:text-xl drop-shadow-md text-center font-medium">
              Serving families across <strong className="text-amber-200">{(communityStats as any)?.count ? `${(communityStats as any).count.toLocaleString()}+` : '26,306+'} verified senior living communities</strong>
            </p>
          </div>
          
          {/* Verification Badge - Larger */}
          <div className="mb-4 animate-fade-in-up animation-delay-900">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full text-white dark:text-gray-200 text-sm md:text-base font-medium shadow-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              Verified Pricing • Real Availability • No Pressure
            </div>
          </div>
          

        </div>
      </section>

      {/* Featured & Coastal Communities Section - Position 2 */}
      <section className="px-4 py-12 relative overflow-hidden dark:bg-gray-800">
        {/* Background Ocean Wave Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Ocean waves background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-cyan-50/40 dark:from-gray-900/60 dark:to-gray-800/60"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Featured & Coastal Communities
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Premium communities</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Ocean views available</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$3,200 - $4,800</div>
              <div className="text-sm text-purple-600 dark:text-purple-300 font-medium">Featured & coastal</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {(((coastalCommunities as any[])?.length || 0) + ((featuredCommunities as any[])?.length || 0))} premium communities • 
            Featured selections and coastal charm
          </p>
        
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
            {/* Show combined premium communities (coastal + featured) */}
            {(coastalLoading || trendingLoading) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-56 h-[30rem] border border-gray-200 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <CardContent className="p-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              premiumCommunities.map((community: any, index) => (
                <EnhancedCommunityCard
                  key={`premium-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant={index < 4 ? 'coastal' : 'featured'}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Complete Senior Services Directory - Enhanced Styling */}
      <section className="px-4 py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Services & Vendors - Top Priority */}
          <div className="mb-8">
            <Card className="group bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-400 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20"></div>
              <CardContent className="p-10 relative z-10">
                <div className="text-center mb-8">
                  {/* Powerful Header Layout */}
                  <div className="mb-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                      Your Personal Senior Living
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4 leading-tight">
                      Concierge Experts
                    </h3>
                    <div className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium mb-4">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
                        White-Glove Service • Dedicated Support • Expert Guidance
                      </span>
                    </div>
                  </div>
                  
                  {/* Elegant Badge */}
                  <div className="mb-6">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 rounded-full text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                      Complete Concierge Services
                    </div>
                  </div>
                  
                  {/* Concise Impact Statement */}
                  <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Professional services and trusted vendors for every step of your senior living journey
                  </p>
                </div>
                
                {/* Service Categories Grid */}
                <div className="text-center mb-8">
                  {/* Elegant "Now Available" Badge */}
                  <div className="mb-6">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                      Now Available!
                    </div>
                  </div>
                  
                  {/* Beautiful Services Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                      Services & Vendors
                    </h3>
                  </div>
                  
                  {/* Comprehensive Service Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
                    Our carefully vetted network of professional service providers handles the complexities of senior living transitions. Whether you need experienced movers, reliable transportation without smartphones, elder law attorneys, medical equipment specialists, or beautiful floral arrangements - we've partnered with trusted experts who understand the unique needs of seniors and their families.
                  </p>
                </div>

                {/* Horizontal Service Cards with Amazon Integration */}
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
                  
                  {/* Moving Services Card */}
                  <Link href="/moving" className="flex-shrink-0 w-64">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-400 bg-white dark:bg-gray-800 h-80">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center p-4">
                          <div className="text-center">
                            <Truck className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-green-800 dark:text-green-200">TWO MEN</div>
                            <div className="text-sm text-green-600 dark:text-green-300">AND A TRUCK</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">
                            🟢 LIVE NOW
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Moving Services</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          Professional movers, packing, storage, and consultation services for senior transitions.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">6 Service Options</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Senior Specialists</span>
                          </div>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          View Services →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Transportation Services Card */}
                  <Link href="/transportation" className="flex-shrink-0 w-64">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-400 bg-white dark:bg-gray-800 h-80">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center p-4">
                          <div className="text-center">
                            <Car className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">GoGoGrandparent</div>
                            <div className="text-sm text-blue-600 dark:text-blue-300">Transportation</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1 font-bold">
                            🟢 LIVE NOW
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Transportation Services</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          No smartphone needed transportation and delivery services for seniors.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">5 Service Options</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">No Smartphone Required</span>
                          </div>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          View Services →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Floral Services Card */}
                  <Link href="/floral" className="flex-shrink-0 w-64">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-pink-200 dark:border-pink-400 bg-white dark:bg-gray-800 h-80">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-800 flex items-center justify-center p-4">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🌸</div>
                            <div className="text-lg font-bold text-pink-800 dark:text-pink-200">1-800-FLORALS</div>
                            <div className="text-sm text-pink-600 dark:text-pink-300">Professional Florist</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-pink-500 text-white text-xs px-2 py-1 font-bold">
                            🟢 LIVE NOW
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Floral Services</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          Professional floral arrangements and delivery to senior living communities.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Same-day delivery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Move-in specials</span>
                          </div>
                        </div>
                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                          View Services →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Amazon Move-In Essentials Card */}
                  <Link href="/move-in-essentials" className="flex-shrink-0 w-64">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-orange-200 dark:border-orange-400 bg-white dark:bg-gray-800 h-80">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900 dark:to-amber-800 flex items-center justify-center p-4">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📦</div>
                            <div className="text-lg font-bold text-orange-800 dark:text-orange-200">AMAZON</div>
                            <div className="text-sm text-orange-600 dark:text-orange-300">Move-In Essentials</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-orange-500 text-white text-xs px-2 py-1 font-bold">
                            🟢 LIVE NOW
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Amazon Marketplace</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          Essential move-in products including bathroom accessories, bedroom items, and furniture supplies.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">7 Essential Products</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Prime Shipping</span>
                          </div>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          View Products →
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Legal & Financial Services Card */}
                  <div className="flex-shrink-0 w-64">
                    <Card className="overflow-hidden transition-all duration-300 border-2 border-purple-200 dark:border-purple-400 bg-white dark:bg-gray-800 h-80 opacity-75">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center p-4">
                          <div className="text-center">
                            <Scale className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-purple-800 dark:text-purple-200">Legal & Financial</div>
                            <div className="text-sm text-purple-600 dark:text-purple-300">Elder Law</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gray-500 text-white text-xs px-2 py-1 font-bold">
                            COMING SOON
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Legal & Financial</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          Elder law attorneys and financial planning specialists for senior transitions.
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                            <span className="text-sm text-gray-500">Elder Law Attorneys</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                            <span className="text-sm text-gray-500">Financial Planning</span>
                          </div>
                        </div>
                        <Button className="w-full bg-gray-400 text-white cursor-not-allowed" disabled>
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <Link href="/senior-services">
                    <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      Explore All Services →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Services & Vendors Horizontal Slider */}
          <div className="mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Featured Service Providers
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Live integrations active</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">More providers launching weekly</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">Now Available!</div>
                  <div className="text-sm text-green-600 dark:text-green-300 font-medium">Live vendor partnerships</div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <div className="text-green-600 dark:text-green-400 mr-2">✅</div>
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    <strong>Live Provider Network:</strong> Real verified service providers now available. Direct booking and exclusive MySeniorValet member pricing.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                3 live vendor partnerships • 1-800-FLORALS • TWO MEN AND A TRUCK • GoGoGrandparent + Amazon supply integration
              </p>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
              {/* Live Provider: Two Men and a Truck */}
              <Link href="/moving">
                <Card className="overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-400 bg-white dark:bg-gray-800">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🚛</div>
                        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">TWO MEN AND A TRUCK</div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold animate-pulse">
                        🟢 LIVE NOW
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">TWO MEN AND A TRUCK</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4.8</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Moving Services</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Quote-based</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">96% Success Rate</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Senior specialists</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">400+ locations nationwide</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Full insurance coverage</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2">
                      Get Free Quote
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Live Provider: 1-800-FLORALS */}
              <Link href="/florals">
                <Card className="overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all duration-300 border-2 border-pink-200 dark:border-pink-400 bg-white dark:bg-gray-800">
                  <div className="relative">
                    <div 
                      className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-800 flex items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundImage: conciergeImages?.[1]?.url ? `url(${conciergeImages[1].url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="text-center">
                        <div className="text-4xl mb-2">🌸</div>
                        <div className="text-lg font-bold text-pink-800 dark:text-pink-200">1-800-FLORALS</div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold animate-pulse">
                        🟢 LIVE NOW
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">1-800-FLORALS</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4.9</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Floral Services</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-pink-600 dark:text-pink-400">$29.99+</span>
                      <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded-full">Same Day Delivery</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Professional arrangements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Community delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Special occasions</span>
                      </div>
                    </div>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm py-2">
                      Order Flowers
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Live Provider: GoGoGrandparent Transportation */}
              <Link href="/transportation">
                <Card className="overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-400 bg-white dark:bg-gray-800">
                  <div className="relative">
                    <div 
                      className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900 dark:to-cyan-800 flex items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundImage: conciergeImages?.[2]?.url ? `url(${conciergeImages[2].url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="text-center relative z-10 bg-white/90 rounded-lg p-3 shadow-lg">
                        <div className="text-2xl mb-2">🚗</div>
                        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">GoGoGrandparent</div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">Transportation Services</div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold animate-pulse">
                        🟢 LIVE NOW
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">GoGoGrandparent</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">4.7</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Transportation Services</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">$16.99+/month</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">No Smartphone</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">Call (855) 464-6872</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">24/7 availability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">GoGoGuardian monitoring</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2">
                      <Phone className="w-4 h-4 mr-2" />
                      Call to Book
                    </Button>
                  </CardContent>
                </Card>
              </Link>


              
              {/* Service Provider Cards - Framework Ready */}
              {Array.from({ length: 5 }).map((_, index) => {
                const serviceTypes = [
                  { 
                    name: "TechCare Support", 
                    category: "Technology Support", 
                    rating: "4.8", 
                    price: "$45/visit", 
                    features: ["Cell phone setup", "Wifi installation", "Device training"],
                    color: "from-blue-500 to-blue-600",
                    icon: "📱"
                  },
                  { 
                    name: "Elder Law Partners", 
                    category: "Legal Services", 
                    rating: "4.9", 
                    price: "$200/hr", 
                    features: ["Estate planning", "Medicare guidance", "Power of attorney"],
                    color: "from-purple-500 to-purple-600",
                    icon: "⚖️"
                  },
                  { 
                    name: "Medical Supply Co", 
                    category: "Medical Equipment", 
                    rating: "4.7", 
                    price: "$25/day", 
                    features: ["Mobility aids", "Safety equipment", "Home delivery"],
                    color: "from-orange-500 to-orange-600",
                    icon: "🦽"
                  },
                  { 
                    name: "Senior Financial Advisors", 
                    category: "Financial Planning", 
                    rating: "4.9", 
                    price: "$150/hr", 
                    features: ["Retirement planning", "Long-term care", "Investment advice"],
                    color: "from-emerald-500 to-emerald-600",
                    icon: "💰"
                  },
                  { 
                    name: "CleanStart Specialists", 
                    category: "Junk Removal", 
                    rating: "4.6", 
                    price: "$120/load", 
                    features: ["Decluttering", "Donation sorting", "Estate cleanouts"],
                    color: "from-gray-500 to-gray-600",  
                    icon: "🗑️"
                  },
                  { 
                    name: "MediCare Transport", 
                    category: "Medical Transport", 
                    rating: "4.8", 
                    price: "$35/trip", 
                    features: ["Non-emergency", "Wheelchair accessible", "Insurance billing"],
                    color: "from-red-500 to-red-600",
                    icon: "🚑"
                  },
                  { 
                    name: "Comfort Care Companions", 
                    category: "Companion Care", 
                    rating: "4.9", 
                    price: "$25/hr", 
                    features: ["Social visits", "Light housekeeping", "Meal preparation"],
                    color: "from-pink-500 to-pink-600",
                    icon: "👥"
                  }
                ];
                
                const service = serviceTypes[index] || serviceTypes[0];
                
                return (
                  <Card key={index} className="overflow-hidden flex-shrink-0 w-80 h-[28rem] border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="relative">
                      <div className={`h-32 bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                        <div className="text-4xl">{service.icon}</div>
                        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                          ⭐ {service.rating}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 flex flex-col h-[calc(28rem-8rem)]">
                      <div className="mb-2">
                        <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-1">{service.category}</div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{service.name}</h4>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{service.price}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Starting rate</div>
                      </div>
                      
                      <div className="space-y-1 mb-4 flex-grow">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2 mt-auto">
                        <Button 
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 text-xs font-semibold"
                          disabled
                        >
                          Contact Provider
                        </Button>
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                          API Integration Coming Soon
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Care Marketplace - Coming Soon */}
          <div className="mb-8">
            <Card className="group bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white text-sm font-semibold mb-4 shadow-lg">
                    <span className="mr-2">🚀</span>
                    Now Available!
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Care Marketplace</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
                    For Independent Living and below, connect with local healthcare and caregiving services in your area
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">IHSS & SLS Services</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">In-home support services</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Stethoscope className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Home Healthcare</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Nursing & medical care</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Occupational Therapy</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Daily living skills</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Home className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">In-home Care Programs</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Comprehensive care plans</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Users2 className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Caregivers & Home Care</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Personal care providers</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Flower className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">Hospice Care</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">End-of-life comfort care</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200" disabled>
                    Care Marketplace - Launching Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Marketplace Featured Services Horizontal Slider */}
          <div className="mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Featured Healthcare Services
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">Demo services shown</span>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Real providers launching soon</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">Now Available!</div>
                  <div className="text-sm text-orange-600 dark:text-orange-300 font-medium">Healthcare marketplace</div>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <div className="text-orange-600 dark:text-orange-400 mr-2">🚀</div>
                  <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    <strong>Launching This Week:</strong> Preview of healthcare services for Independent Living and below. Real certified providers will be available in the full Care Marketplace launch.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                6 healthcare service categories • Specialized care for Independent Living and below
              </p>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
              {/* Healthcare Service Cards - Framework Ready */}
              {Array.from({ length: 6 }).map((_, index) => {
                const healthcareServices = [
                  { 
                    name: "Sacramento IHSS Services", 
                    category: "IHSS & SLS Services", 
                    rating: "4.9", 
                    price: "$18/hr", 
                    features: ["State-funded program", "Personal care", "Housekeeping services"],
                    color: "from-blue-500 to-blue-600",
                    icon: "🏠"
                  },
                  { 
                    name: "CareTeam Home Health", 
                    category: "Home Healthcare", 
                    rating: "4.8", 
                    price: "$65/visit", 
                    features: ["RN-supervised care", "Medication management", "Wound care"],
                    color: "from-green-500 to-green-600",
                    icon: "🩺"
                  },
                  { 
                    name: "Mobility Masters OT", 
                    category: "Occupational Therapy", 
                    rating: "4.9", 
                    price: "$120/session", 
                    features: ["Home safety assessments", "Adaptive equipment", "Fall prevention"],
                    color: "from-purple-500 to-purple-600",
                    icon: "🧩"
                  },
                  { 
                    name: "ComfortCare Program", 
                    category: "In-home Care Programs", 
                    rating: "4.7", 
                    price: "$28/hr", 
                    features: ["Comprehensive care plans", "Family coordination", "24/7 support"],
                    color: "from-teal-500 to-teal-600",
                    icon: "🏡"
                  },
                  { 
                    name: "Golden Years Caregivers", 
                    category: "Caregivers & Home Care", 
                    rating: "4.8", 
                    price: "$22/hr", 
                    features: ["Certified caregivers", "Companion care", "Light housekeeping"],
                    color: "from-orange-500 to-orange-600",
                    icon: "👨‍⚕️"
                  },
                  { 
                    name: "Serenity Hospice Care", 
                    category: "Hospice Care", 
                    rating: "4.9", 
                    price: "Medicare covered", 
                    features: ["24/7 on-call support", "Pain management", "Family bereavement"],
                    color: "from-indigo-500 to-indigo-600",
                    icon: "🕊️"
                  }
                ];
                
                const service = healthcareServices[index] || healthcareServices[0];
                
                return (
                  <Card key={index} className="overflow-hidden flex-shrink-0 w-80 h-[28rem] border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="relative">
                      <div className={`h-32 bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                        <div className="text-4xl">{service.icon}</div>
                        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800">
                          ⭐ {service.rating}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 flex flex-col h-[calc(28rem-8rem)]">
                      <div className="mb-2">
                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">{service.category}</div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{service.name}</h4>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{service.price}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Starting rate</div>
                      </div>
                      
                      <div className="space-y-1 mb-4 flex-grow">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2 mt-auto">
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 text-xs font-semibold"
                          disabled
                        >
                          Request Care Services
                        </Button>
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                          Launching This Week
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Complete Senior Living Intelligence - Third Position */}
          <div className="mb-8">
            <Card className="group bg-gradient-to-br from-blue-600 to-purple-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-400/30 group-hover:to-purple-500/30 transition-all duration-300"></div>
              <CardContent className="p-10 relative z-10">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <span className="text-3xl">🧠</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">AI-Powered Senior Living Intelligence</h3>
                      <p className="text-blue-100 text-lg">Industry-leading transparency through 4-AI verification: Claude + Gemini + ChatGPT + Grok</p>
                    </div>
                  </div>
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  <div className="text-white">
                    <h4 className="text-xl font-bold mb-4 text-yellow-300">🚀 What Makes This Revolutionary</h4>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-yellow-300 font-bold">1</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-yellow-200 mb-1">Natural Language AI Search</h5>
                          <p className="text-white/90 text-sm">Ask naturally: "Find memory care under $4,000 in Sacramento with pet therapy" - our AI understands context, location, budget, and specific needs</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-300 font-bold">2</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-200 mb-1">Live Pricing Intelligence</h5>
                          <p className="text-white/90 text-sm">AI shows complete pricing spectrum from affordable HUD housing ($303-$800) to luxury resort-style communities ($8,000+) - verified pricing across all care levels and budgets</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-purple-300 font-bold">3</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-purple-200 mb-1">Geospatial Mapping AI</h5>
                          <p className="text-white/90 text-sm">Interactive clustering technology processes 26,306+ communities in real-time, showing live data pins (green = verified pricing, red = call for pricing)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-white">
                    <h4 className="text-xl font-bold mb-4 text-cyan-300">⚡ Industry-Leading 4-AI Verification System</h4>
                    <p className="text-blue-100 text-sm mb-4">Unprecedented transparency through 4-AI collaboration - each AI cross-verifies the others for absolute accuracy</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">🧠</div>
                          <Badge className="bg-orange-500 text-white text-xs px-2 py-1">Claude 4.0</Badge>
                        </div>
                        <h5 className="font-semibold text-orange-200 mb-1">Complex Care Planning</h5>
                        <p className="text-white/80 text-xs">Advanced reasoning for matching care needs, analyzing medical requirements, and understanding family dynamics</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">🔍</div>
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">Gemini 2.5</Badge>
                        </div>
                        <h5 className="font-semibold text-blue-200 mb-1">Visual Intelligence</h5>
                        <p className="text-white/80 text-xs">Photo analysis of facilities, virtual tour processing, and visual quality assessment of communities</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">💰</div>
                          <Badge className="bg-green-500 text-white text-xs px-2 py-1">ChatGPT-4o</Badge>
                        </div>
                        <h5 className="font-semibold text-green-200 mb-1">Financial Transparency</h5>
                        <p className="text-white/80 text-xs">Exposes hidden fees, analyzes contracts, tracks price escalations, and reveals true total costs</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl">🚀</div>
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1 relative">
                            Grok/XAI
                            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1 py-0.5 rounded-full font-bold">Soon</span>
                          </Badge>
                        </div>
                        <h5 className="font-semibold text-red-200 mb-1">Real-Time Fact Checking</h5>
                        <p className="text-white/80 text-xs">Live verification of current availability, real-time pricing updates, and instant regulatory compliance checks</p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-400/30">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🔄</span>
                        <h5 className="font-semibold text-purple-200">Multi-AI Cross-Verification</h5>
                      </div>
                      <p className="text-white/90 text-sm">All 4 AIs work together, checking each other's findings to ensure 98% accuracy in pricing, availability, and community information</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="text-xl font-bold text-white mb-4 text-center">🌟 What You Can Do Right Now</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl mb-2">💬</div>
                      <h5 className="font-semibold text-white mb-1">Ask Naturally</h5>
                      <p className="text-white/80 text-sm">"Pet-friendly assisted living under $5,000 near me"</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">🔍</div>
                      <h5 className="font-semibold text-white mb-1">See Live Data</h5>
                      <p className="text-white/80 text-sm">Green pins = verified pricing, red pins = call for pricing</p>
                    </div>
                    <div>
                      <div className="text-3xl mb-2">⚡</div>
                      <h5 className="font-semibold text-white mb-1">Get Instant Results</h5>
                      <p className="text-white/80 text-sm">AI-ranked communities with pricing transparency</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <p className="text-white text-lg mb-4">Ready to get started?</p>
                  
                  {/* Interactive Demo Section */}
                  <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h4 className="text-lg font-bold text-white mb-4 text-center">🚀 Try It Right Now - Experience the AI</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Interactive Search Bar */}
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white/95 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Try: 'Memory care under $4,000 near Sacramento with therapy'"
                            onChange={(e) => {
                              // Real-time AI search demonstration
                              if (e.target.value.length > 10) {
                                // Show typing indicator
                                const indicator = document.getElementById('ai-indicator');
                                if (indicator) {
                                  indicator.textContent = 'AI analyzing your request...';
                                  indicator.className = 'text-xs text-yellow-300 animate-pulse';
                                }
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const query = (e.target as HTMLInputElement).value;
                                if (query.trim()) {
                                  // Navigate to search with the query
                                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                                }
                              }
                            }}
                          />
                        </div>
                        <div id="ai-indicator" className="text-xs text-white/60">Start typing to see AI in action</div>
                        
                        {/* Quick Demo Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs hover:bg-blue-500/30 transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                              if (input) {
                                input.value = 'Assisted living under $3000 in Sacramento';
                                input.focus();
                              }
                            }}
                          >
                            Assisted Living
                          </button>
                          <button 
                            className="px-3 py-1 bg-green-500/20 text-green-200 rounded-full text-xs hover:bg-green-500/30 transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                              if (input) {
                                input.value = 'Pet-friendly memory care with therapy programs';
                                input.focus();
                              }
                            }}
                          >
                            Pet-Friendly
                          </button>
                          <button 
                            className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs hover:bg-purple-500/30 transition-colors"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                              if (input) {
                                input.value = 'HUD affordable housing near me';
                                input.focus();
                              }
                            }}
                          >
                            HUD Housing
                          </button>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 py-3 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Memory care"]') as HTMLInputElement;
                            const query = input?.value?.trim() || '';
                            if (query) {
                              window.location.href = `/search?q=${encodeURIComponent(query)}`;
                            } else {
                              window.location.href = '/search';
                            }
                          }}
                        >
                          🚀 Try AI-Powered Search Now
                        </Button>
                        <p className="text-white/80 text-sm mt-3 text-center">Experience the future of senior living discovery</p>
                      </div>

                      {/* Miniature Interactive Map */}
                      <div className="relative">
                        <div className="w-full h-64 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-lg border border-white/30 overflow-hidden relative">
                          {/* Mock Map Interface */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100/10 to-blue-100/10">
                            {/* Map Pins */}
                            <div className="absolute top-8 left-12 w-3 h-3 bg-green-400 rounded-full animate-pulse cursor-pointer" title="Verified Pricing"></div>
                            <div className="absolute top-16 right-16 w-3 h-3 bg-red-400 rounded-full animate-pulse cursor-pointer" title="Call for Pricing"></div>
                            <div className="absolute bottom-20 left-20 w-3 h-3 bg-green-400 rounded-full animate-pulse cursor-pointer" title="HUD Property"></div>
                            <div className="absolute top-20 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse cursor-pointer" title="Live Pricing"></div>
                            <div className="absolute bottom-16 right-12 w-3 h-3 bg-red-400 rounded-full animate-pulse cursor-pointer" title="Contact Required"></div>
                            
                            {/* Search Result Popup */}
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-48">
                              <div className="text-xs font-semibold text-gray-800 mb-1">AI Search Results</div>
                              <div className="text-xs text-gray-600 mb-2">Found 23 matches</div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">Memory Care</span>
                                  <span className="text-green-600 font-semibold">$3,850</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">Assisted Living</span>
                                  <span className="text-green-600 font-semibold">$2,400</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Map Controls */}
                            <div className="absolute bottom-4 right-4 bg-white/90 rounded p-2">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Live Pricing</span>
                              </div>
                              <div className="flex space-x-2 mt-1">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Contact for Pricing</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center mt-3">
                          <Link href="/search">
                            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 text-sm">
                              View Full Interactive Map
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          

        </div>
      </section>

      {/* HUD Communities Showcase - Position 3 */}
      <section className="px-4 py-12 relative overflow-hidden dark:bg-gray-800">
        {/* Background Government Building Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Government building background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/40 to-emerald-50/40 dark:from-gray-900/60 dark:to-gray-800/60"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                HUD Communities & Government Verified
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">Government verified pricing</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Income-based affordable</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">$57 - $800</div>
              <div className="text-sm text-green-600 dark:text-green-300 font-medium">HUD verified</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            {(hudProperties as any[])?.length || 8} affordable communities • 
            Government transparency and income-based options
          </p>
        
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{scrollBehavior: 'smooth'}}>
            {/* Show HUD communities */}
            {(!hudProperties || (hudProperties as any[]).length === 0) ? (
              // Loading skeleton cards
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden flex-shrink-0 w-56 h-[30rem] border border-gray-200 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <CardContent className="p-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              (hudProperties as any[]).slice(0, 8).map((community: any, index) => (
                <EnhancedCommunityCard
                  key={`hud-${community.id}-${index}`}
                  community={community}
                  index={index}
                  variant='hud'
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Complete Senior Services Directory */}
      <section className="px-4 py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Immediate Call to Action Banner */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 mb-12 text-center shadow-xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white">Order Fresh Flowers Now</h3>
                <p className="text-pink-100">Professional arrangements delivered to your senior living community</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                className="bg-white text-pink-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg"
                onClick={() => window.open('https://www.dpbolvw.net/8j98kjspjr6878BGG7G96CCGF898?sid=movein_support_florals', '_blank')}
              >
                🌹 Order from 1-800-FLORALS →
              </Button>
              <div className="flex items-center gap-2 text-white">
                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Same-day delivery available</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE ONLINE STATUS
              </Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2 text-sm font-semibold">NEW ECOSYSTEM</Badge>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Senior Services Directory</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Beyond communities - everything seniors need for independent living</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">Services are live and available now - no longer coming soon!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center relative">
                <Truck className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Moving Services</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Senior move specialists</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-1 mt-2">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center relative">
                <Pill className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Rx Delivery</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Medication services</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-1 mt-2">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center relative">
                <Building className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Senior Centers</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Community programs</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-1 mt-2">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center relative">
                <Ambulance className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Medical Transport</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Non-emergency rides</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-1 mt-2">Example Service</Badge>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/senior-services">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Explore All Services →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
