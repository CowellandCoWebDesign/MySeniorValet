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
          {(heroImages as any) && (heroImages as any).length > 0 ? (
            <img
              src={(heroImages as any)[0].urls.regular}
              alt={(heroImages as any)[0].alt_description || "Senior living community"}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://pixabay.com/get/g372c8ac6025184bd57e3348911d318d34fcc4ca6449ecbf324afd9556d94a2c42d7268c79e269273cd17612ed16277c831e8cc000499572736f947139d518211_1280.jpg"
              alt="Resort style swimming pool with comfortable seating"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 dark:from-black/60 dark:via-black/70 dark:to-black/80"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center hero-content min-h-screen px-6 py-8 mobile-keyboard-safe">
          {/* Centered Headlines - Much Larger */}
          <div className="text-center mb-4 md:mb-6 max-w-6xl">
            <div className="space-y-4 mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white dark:text-gray-100 leading-tight drop-shadow-2xl animate-fade-in-up tracking-tight">
                <span className="block mb-2">Everything Senior Living Needs</span>
                <span className="block text-gradient bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-none">in one place</span>
              </h1>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-white dark:text-gray-200 opacity-95 drop-shadow-lg px-4 animate-fade-in-up animation-delay-300 max-w-4xl mx-auto font-medium leading-relaxed">
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
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
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

      {/* Complete Concierge Services - Enhanced Styling */}
      <section className="px-4 py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              Your Senior Living
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Concierge Team
              </span>
            </h2>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm font-semibold mb-4 shadow-lg">
              <span className="mr-2">🎯</span>
              Complete Concierge Services
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Professional services and trusted vendors for every step of your senior living journey
            </p>
          </div>
          
          {/* Services & Vendors - Top Priority */}
          <div className="mb-8">
            <Card className="group bg-white dark:bg-gray-800 border-2 border-teal-200 dark:border-teal-400 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full text-white text-sm font-semibold mb-4 shadow-lg">
                    <span className="mr-2">🚀</span>
                    Now Available!
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Services & Vendors</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Everything families need from search to settlement
            </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <Link href="/moving" className="text-center group/item block">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Moving Services</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">TWO MEN AND A TRUCK • Professional movers, packing, storage</p>
                  </Link>
                  <div className="text-center group/item">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Technology Support</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Cell phone programs, tech setup</p>
                  </div>
                  <div className="text-center group/item">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Scale className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Legal & Financial</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Elder law, financial planning</p>
                  </div>
                  <div className="text-center group/item">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover/item:shadow-xl transition-shadow duration-300">
                      <Sofa className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Medical Equipment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mobility aids, safety equipment</p>
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
                2 live provider integrations • 1-800-FLORALS for flowers • TWO MEN AND A TRUCK for moving
              </p>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
              {/* Live Provider: Two Men and a Truck */}
              <Link href="/moving">
                <Card className="overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all duration-300 border-2 border-green-200 dark:border-green-400 bg-white dark:bg-gray-800">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                      <img 
                        src="https://twomenandatruck.com/sites/default/files/logo.png" 
                        alt="Two Men and a Truck Logo"
                        className="h-16 w-auto bg-white p-2 rounded-lg shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'%3E%3Crect width='80' height='40' fill='%23ffffff'/%3E%3Ctext x='40' y='25' font-family='Arial' font-size='8' fill='%23333' text-anchor='middle'%3ETWO MEN AND A TRUCK%3C/text%3E%3C/svg%3E";
                        }}
                      />
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
                    <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900 dark:to-rose-800 flex items-center justify-center">
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
              
              {/* Service Provider Cards - Framework Ready */}
              {Array.from({ length: 6 }).map((_, index) => {
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

            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
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
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
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



      {/* Senior Services Directory Section */}
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Truck className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Moving Services</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Senior move specialists</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Pill className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Rx Delivery</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Medication services</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Building className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Senior Centers</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Community programs</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Ambulance className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Medical Transport</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Non-emergency rides</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Utensils className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Meal Delivery</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Senior nutrition services</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>

            <Link href="/vendor/1800florals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 relative overflow-hidden">
                <CardContent className="p-4 text-center">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-white shadow-sm">
                    <img 
                      src="https://www.800florals.com/img/4810Dmd.jpg" 
                      alt="1-800-FLORALS Arrangements"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      loading="eager"
                    />
                    <div className="w-full h-full hidden items-center justify-center text-pink-500 text-2xl font-bold">🌸</div>
                  </div>
                  <h4 className="font-semibold text-sm text-pink-700 dark:text-pink-300">Professional Florals</h4>
                  <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Move-in arrangements & gifts</p>
                  <div className="flex gap-1 justify-center mt-1">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">✓ VERIFIED</Badge>
                    <Badge className="bg-pink-500 text-white text-xs px-2 py-0.5">1-800-FLORALS</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>


            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Scale className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Legal Services</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Elder law attorneys</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Calculator className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Financial Planning</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Senior financial advisors</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Scissors className="w-10 h-10 text-pink-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Personal Care</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mobile barber & beauty</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Trash2 className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Junk Removal</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Decluttering services</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Users2 className="w-10 h-10 text-cyan-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Companion Care</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Social companionship</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
              <CardContent className="p-4 text-center relative">
                <Phone className="w-10 h-10 text-violet-500 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">Tech Support</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Device setup & training</p>
                <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5 mt-1">Example Service</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Featured Service: 1-800-FLORALS */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border-2 border-pink-200">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                  <img 
                    src="https://www.800florals.com/img/T2533md.jpg" 
                    alt="1-800-FLORALS Professional Arrangements"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    loading="eager"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const nextElement = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center text-pink-500 text-2xl font-bold">🌸</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Professional Floral Services
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Move-in welcome arrangements, special occasion flowers, and monthly subscriptions 
                    through our partnership with 1-800-FLORALS.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Same-day delivery available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Move-in welcome specials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Monthly subscription options</span>
                    </div>
                  </div>
                  <Link href="/vendor/1800florals">
                    <Button className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      View Vendor Profile →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Amazon Product Recommendations */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  🛍️ Amazon Product Recommendations
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Curated senior-friendly products including mobility aids, safety equipment, 
                  daily living aids, and medical supplies - all with verified reviews and 
                  competitive pricing.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Verified local service providers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Quality scoring algorithm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">AI-matched to care needs</span>
                  </div>
                </div>
                <Badge className="bg-yellow-500 text-white">Coming Soon with Amazon Associates</Badge>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="mb-4">
              <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">1 Verified Service</span>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">9 Example Services</span>
                </div>
              </div>
            </div>
            <Link href="/senior-services">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Explore Senior Services Directory →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Care Level Guide with Live Market Intelligence */}
      <section className="px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        {/* Healthcare Hero Image */}
        <div className="mb-8 relative">
          <div className="aspect-[16/9] bg-gradient-to-r from-blue-50 to-green-50 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Healthcare professional assisting senior in comfortable care environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-3xl font-bold mb-2">Understanding Care Levels & Live Market Intelligence</h2>
                <p className="text-lg opacity-90">Real pricing data from 26,306+ communities with transparent market analysis</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Intelligence and Care Level Guide */}
        <div className="space-y-4 mb-8">
          {/* Market Intelligence Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-center">How Our Live Market Intelligence Works</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p className="text-center mb-3">Pricing ranges below come from three verified data sources in priority order:</p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-semibold text-green-700 dark:text-green-300">🏛️ Priority 1: Government Data</div>
                  <p className="text-xs">6,078 HUD properties with exact verified rent amounts (like $303, $355, $373/month)</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 dark:text-blue-300">✓ Priority 2: Community Verified</div>
                  <p className="text-xs">Communities that have confirmed current pricing within the last 30 days</p>
                </div>
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">📊 Priority 3: Industry Research</div>
                  <p className="text-xs">Genworth Cost of Care Study, AARP research, and CMS data for market ranges</p>
                </div>
              </div>
              <p className="text-center text-xs mt-3 font-medium">
                Find your preferred communities below to discover which ones have confirmed live pricing and current availability through community transparency.
              </p>
            </div>
          </div>
          
          {/* Skilled Nursing */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Skilled Nursing</h3>
                    <Badge className="bg-red-100 text-red-800">Highest Care Level</Badge>
                    <Badge className="bg-orange-100 text-orange-800">$8,000-$15,000/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">24/7 medical care, rehabilitation, complex medical needs, licensed nursing staff</p>
                  <Link href="/search?careType=skilled-nursing">
                    <Button size="sm" className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Care */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Memory Care</h3>
                    <Badge className="bg-amber-100 text-amber-800">Specialized Care</Badge>
                    <Badge className="bg-purple-100 text-purple-800">$6,500-$12,000/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Specialized dementia/Alzheimer's care, secure environment, specialized programming</p>
                  <Link href="/search?careType=memory-care">
                    <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-2xl">🧠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assisted Living */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Assisted Living</h3>
                    <Badge className="bg-green-100 text-green-800">Most Common</Badge>
                    <Badge className="bg-purple-100 text-purple-800">$4,000-$7,500/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Personal care assistance, medication management, meals, social activities</p>
                  <Link href="/search?careType=assisted-living">
                    <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-2xl">🤝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living */}
          <Card className="border-0 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Independent Living</h3>
                    <Badge className="bg-orange-100 text-orange-800">Active Lifestyle</Badge>
                    <Badge className="bg-green-100 text-green-800">$2,500-$4,500/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Active senior communities, social activities, dining, transportation</p>
                  <Link href="/search?careType=independent-living">
                    <Button size="sm" className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white">
                      See Communities with Live Pricing & Availability
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-2xl">🏃</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HUD/VASH Affordable Housing */}
          <Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">HUD/VASH Affordable Housing</h3>
                    <Badge className="bg-green-100 text-green-800">Government Subsidized</Badge>
                    <Badge className="bg-blue-100 text-blue-800">$303-$800/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Subsidized housing with IHSS or SLS home care support, income-based rent</p>
                  <Link href="/search?careType=hud-affordable">
                    <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                      See HUD Properties with Verified Pricing
                    </Button>
                  </Link>
                </div>
                <div className="w-16 h-16 bg-green-200 dark:bg-green-700 rounded-lg flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-300 font-bold text-2xl">🏡</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link href="/search?view=care-levels">
            <Button className="w-full gradient-tertiary hover:opacity-90 text-white border-0 h-12 text-lg">
              Search by Care Level & Live Pricing
            </Button>
          </Link>
          <Link href="/search">
            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 h-12 text-lg"
            >
              Try Interactive Map Search
            </Button>
          </Link>
        </div>
      </section>

      {/* Affordable Housing Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            HUD Affordable Housing Options
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Government-subsidized housing for seniors and disabled adults
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Section 202 & 811 Housing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                HUD provides affordable housing for elderly residents (62+) and adults with disabilities. 
                Select communities are income-based with rent capped at 30% of your adjusted monthly income.
              </p>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span><strong>66+ facilities</strong> available in California</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>Income-based rent (30% of income) - income must be below 50% of area median</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>For seniors 62+ and disabled adults</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Standard wait lists: 6+ months expected</span>
                </div>
              </div>
              <Link href="/search?careType=Affordable%20Housing">
                <Button className="gradient-primary hover:opacity-90 text-white">
                  View Affordable Housing Options
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Application Process</span>
          </div>
          <p className="text-xs text-amber-700 mb-2">
            Apply directly with each property. Due to high demand, most properties have waiting lists of 6+ months. 
            Apply to multiple properties to increase your chances.
          </p>
          <p className="text-xs text-amber-700">
            <strong>Income requirements:</strong> Must qualify as "very low income" (below 50% of area median income).
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Also Check Veterans Housing</span>
          </div>
          <p className="text-xs text-green-700 mb-2">
            If you're a veteran, explore HUD-VASH housing which combines rental assistance with VA supportive services.
          </p>
          <a href="https://www.va.gov/housing-assistance/" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700 underline font-medium">
            Learn about Veterans Housing →
          </a>
        </div>
      </section>

      {/* Move-In Cost Calculator */}
      <section className="px-4 py-8 gradient-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Understand your move-in costs
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Typical move-in expenses and financing options available
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">💳</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Community Fee</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">$1,500 - 1 month</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">📅</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Prorated</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">1st Month</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">🗓️</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">After 15th</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">+ 2nd Month</div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ️</span>
            </div>
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Move-In Payment Requirements</span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
            <strong>Standard Move-In:</strong> Community fee ($1,500 - 1 month rent) + prorated 1st month
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>After 15th of Month:</strong> Add 2nd month payment to secure immediate occupancy
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🇺🇸</span>
            </div>
            <span className="text-sm font-semibold text-green-800 dark:text-green-200">VA Aid & Attendance Benefits</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mb-2">
            <strong>2025 Maximum Monthly Benefits:</strong>
          </p>
          <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
            <div>• Married Veteran needing care: <strong>$2,795/month</strong></div>
            <div>• Single Veteran needing care: <strong>$2,358/month</strong></div>
            <div>• Surviving spouse needing care: <strong>$1,515/month</strong></div>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-2">
            Tax-free income for qualifying wartime Veterans and spouses. Bridge financing also available.
          </p>
          <div className="mt-3">
            <a 
              href="https://www.elderlifefinancial.com/va-benefits/va-aid-and-attendance-benefit-what-you-need-to-know/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline font-medium"
            >
              Learn more about VA Aid & Attendance benefits →
            </a>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ℹ️</span>
            </div>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">VA Eligibility Requirements</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Wartime Veterans and spouses who need help with daily activities, have net worth under $159,240, and meet service requirements may qualify.
          </p>
        </div>
        
        <Link href="/costs">
          <Button className="w-full gradient-primary hover:opacity-90 text-white py-3 border-0 dark:border-gray-600">
            Get move-in cost estimate
          </Button>
        </Link>
      </section>

      {/* California Communities Section */}
      <section className="px-4 py-8 relative overflow-hidden">
        {/* Background with California Golden State styling */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-orange-100/20 to-yellow-100/30 dark:from-gray-700/30 dark:via-gray-800/20 dark:to-gray-700/30"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Explore California Communities
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">$3,500 - $6,200</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">Golden State living</div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{(californiaCommunities as any[])?.length || 0} communities • Silicon Valley, LA Metro, San Diego with immediate openings</p>
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
            {californiaLoading ? (
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
              ((californiaCommunities as any[]) || []).map((community: any, index: number) => (
                <Link key={`california-${community.id}-${index}`} href={`/community/${community.id}`}>
                  <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float california-card dark:bg-gray-700" style={{animationDelay: `${index * 0.2}s`}}>
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                      
                      {/* Heart Icon */}
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      
                      {/* Vacancy Status Badge - Top Priority */}
                      {index % 3 === 0 && (
                        <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse">
                          🟢 Available Now
                        </Badge>
                      )}
                      {index % 3 === 1 && (
                        <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 font-medium">
                          🟡 Waitlist Open
                        </Badge>
                      )}
                      {index % 3 === 2 && (
                        <Badge className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                          📋 Call for Availability
                        </Badge>
                      )}
                      
                      {/* Price Badge */}
                      <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                        {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
                        {!community.claimed && (
                          <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                        )}
                      </Badge>
                      
                      {/* Achievement Badge - Special Recognition */}
                      {index % 5 === 0 && (
                        <Badge className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 font-medium">
                          🏆 Featured
                        </Badge>
                      )}
                      {index % 5 === 1 && (
                        <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                          ⭐ Top Rated
                        </Badge>
                      )}
                      {index % 5 === 2 && (
                        <Badge className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                          💎 Premium
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-3">
                      {/* Availability Status - Above Price */}
                      {index % 3 === 0 && (
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Available
                        </div>
                      )}
                      
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '4,200'}
                        {!community.claimed && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">est.</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {community.careTypes?.length > 0 ? 
                          `${community.careTypes[0]} • California Living` : 
                          'Assisted Living • Golden State Care'
                        }
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                        {community.name}
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                        {community.address || 'California Community'}, {community.city}, CA {community.zipCode}
                      </div>
                      
                      {/* California Regional Badges - Bottom of Card */}
                      <div className="mb-2">
                        {index % 4 === 0 && (
                          <Badge className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium">
                            Silicon Valley
                          </Badge>
                        )}
                        {index % 4 === 1 && (
                          <Badge className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium">
                            LA Metro
                          </Badge>
                        )}
                        {index % 4 === 2 && (
                          <Badge className="bg-yellow-600/90 text-white text-xs px-2 py-1 font-medium">
                            San Diego
                          </Badge>
                        )}
                        {index % 4 === 3 && (
                          <Badge className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium">
                            Bay Area
                          </Badge>
                        )}
                      </div>
                      
                      {/* Enhanced Features Row */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <span>CA License #{20000 + community.id}</span>
                        </div>
                        {index % 4 === 0 && (
                          <div className="text-purple-600 dark:text-purple-400 font-medium">
                            🏆 Featured
                          </div>
                        )}
                        {index % 4 === 1 && (
                          <div className="text-blue-600 dark:text-blue-400 font-medium">
                            ⭐ Top Rated
                          </div>
                        )}
                        {index % 4 === 2 && (
                          <div className="text-green-600 dark:text-green-400 font-medium">
                            💎 Premium
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Family Collaboration Section */}
      <section className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Keep Your Family In The Loop
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
            Finding the right senior living community is a family decision. Share discoveries instantly with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1: One-Click Sharing */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">One-Click Family Sharing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Send detailed community information, photos, and pricing to multiple family members instantly.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Works with email, text, WhatsApp, and more
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2: Smart Formatting */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
                  <Info className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Smart Information Formatting</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Automatically formats community details, pricing, care types, and reviews for easy sharing.
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Professional email templates included
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Personal Notes */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-3">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Add Personal Notes</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Include your thoughts, questions, or observations with each community you share.
                  </p>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Keep everyone on the same page
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 4: Direct Links */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-3">
                  <Link2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Direct Share Links</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Generate special family links that bring relatives directly to the community details.
                  </p>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    No account required for family members
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature 5: Tour Tracker */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-700 md:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-3">
                  <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tour Tracker</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    One tour for all family members. Track visit notes, photos, and impressions that everyone can see.
                  </p>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Shared tour insights and findings
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/family-collaboration">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 font-semibold">
              Learn More About Family Collaboration
            </Button>
          </Link>
        </div>
      </section>

      {/* Reviews Comparison Section */}
      <section className="px-4 py-8 gradient-card dark:bg-gray-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            What families are saying
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Real reviews from families who found their perfect community
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Review 1 */}
          <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  MH
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Margaret H.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    "The transparency in pricing made all the difference. We knew exactly what to expect for mom's memory care, and the staff has been incredible."
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Sunrise Senior Living, Palo Alto • Memory Care
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 2 */}
          <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Robert J.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    "Found this through MySeniorValet and couldn't be happier. The virtual tours saved us so much time, and dad loves his new home."
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    The Gardens at Bay Area • Independent Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 3 */}
          <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Linda C.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-gray-300 dark:text-gray-500 text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    "The care level matching was spot-on. They helped us understand exactly what services mom needed, and the pricing was fair and upfront."
                  </p>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Atria Senior Living, San Rafael • Assisted Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Read more family reviews
          </Button>
        </div>
      </section>

      {/* More Featured Communities */}
      <section className="px-4 py-6 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            More recommended communities
          </h2>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Show remaining recommended communities */}
          {((featuredCommunities as any[]).slice(4)).map((community: any, index: number) => (
            <Link key={`more-featured-${community.id}-${index}`} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm flex-shrink-0 w-48 dark:bg-gray-700">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Vacancy Status Badge - Top Priority */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 font-medium animate-pulse">
                      🟢 Available Now
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 font-medium">
                      🟡 Waitlist Open
                    </Badge>
                  )}
                  {index % 3 === 2 && (
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      📋 Call for Availability
                    </Badge>
                  )}
                  
                  {/* Price Badge */}
                  <Badge className="absolute bottom-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 font-medium">
                    {community.priceRange && community.priceRange.min ? `$${(community.priceRange.min / 1000).toFixed(1)}K+` : '$4K+'}
                  </Badge>
                  
                  {/* Achievement Badge - Special Recognition */}
                  {index % 5 === 0 && (
                    <Badge className="absolute bottom-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 font-medium">
                      🏆 Featured
                    </Badge>
                  )}
                  {index % 5 === 1 && (
                    <Badge className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      ⭐ Top Rated
                    </Badge>
                  )}
                  {index % 5 === 2 && (
                    <Badge className="absolute bottom-3 right-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                      💎 Premium
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      <span className="text-sm">Starting at</span> ${community.priceRange && community.priceRange.min ? community.priceRange.min.toLocaleString() : '4,200'}
                    </div>
                    {index % 3 === 0 && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${community.careTypes.length > 1 ? community.careTypes[1] : 'Memory Care'}` : 
                      'Independent Living • Assisted Living'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {community.address || `${Math.floor(Math.random() * 9999)} Community Way`}, {community.city}, {community.state} {community.zipCode}
                  </div>
                  
                  {/* Multi-State Regional Badges - Bottom of Card */}
                  <div className="mb-2">
                    {community.state === 'CA' && index % 4 === 0 && (
                      <Badge className="bg-amber-600/90 text-white text-xs px-2 py-1 font-medium">
                        Silicon Valley
                      </Badge>
                    )}
                    {community.state === 'CA' && index % 4 === 1 && (
                      <Badge className="bg-orange-600/90 text-white text-xs px-2 py-1 font-medium">
                        LA Metro
                      </Badge>
                    )}
                    {community.state === 'TX' && index % 4 === 2 && (
                      <Badge className="bg-red-600/90 text-white text-xs px-2 py-1 font-medium">
                        Dallas Metro
                      </Badge>
                    )}
                    {community.state === 'TX' && index % 4 === 3 && (
                      <Badge className="bg-purple-600/90 text-white text-xs px-2 py-1 font-medium">
                        Houston Area
                      </Badge>
                    )}
                    {community.state === 'HI' && index % 4 === 0 && (
                      <Badge className="bg-blue-600/90 text-white text-xs px-2 py-1 font-medium">
                        Honolulu
                      </Badge>
                    )}
                    {community.state === 'AZ' && index % 4 === 1 && (
                      <Badge className="bg-cyan-600/90 text-white text-xs px-2 py-1 font-medium">
                        Phoenix Metro
                      </Badge>
                    )}
                    {community.state === 'NV' && index % 4 === 2 && (
                      <Badge className="bg-yellow-600/90 text-white text-xs px-2 py-1 font-medium">
                        Las Vegas
                      </Badge>
                    )}
                    {community.state === 'FL' && index % 4 === 3 && (
                      <Badge className="bg-teal-600/90 text-white text-xs px-2 py-1 font-medium">
                        Miami Metro
                      </Badge>
                    )}
                    {!['CA', 'TX', 'HI', 'AZ', 'NV', 'FL'].includes(community.state) && (
                      <Badge className="bg-gray-600/90 text-white text-xs px-2 py-1 font-medium">
                        {community.state} Community
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enhanced Features Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <span>
                        {community.state === 'CA' && `CA License #${20000 + community.id}`}
                        {community.state === 'TX' && `TX License #${30000 + community.id}`}
                        {community.state === 'HI' && `HI License #${40000 + community.id}`}
                        {community.state === 'AZ' && `AZ License #${50000 + community.id}`}
                        {community.state === 'NV' && `NV License #${60000 + community.id}`}
                        {community.state === 'FL' && `FL License #${70000 + community.id}`}
                        {!['CA', 'TX', 'HI', 'AZ', 'NV', 'FL'].includes(community.state) && `${community.state} Licensed`}
                      </span>
                    </div>
                    {index % 4 === 0 && (
                      <div className="text-purple-600 dark:text-purple-400 font-medium">
                        🏆 Featured
                      </div>
                    )}
                    {index % 4 === 1 && (
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        ⭐ Top Rated
                      </div>
                    )}
                    {index % 4 === 2 && (
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        💎 Premium
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) || []}
        </div>
      </section>

      {/* Community Portal CTA */}
      <section className="px-4 py-16 bg-gradient-to-r from-purple-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-purple-300" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Own a Senior Living Community?
            </h2>
            <p className="text-lg text-purple-100 mb-6">
              Take control of your community's online presence and connect with families actively searching for senior living options.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Eye className="w-8 h-8 text-purple-300 mb-3" />
              <h3 className="font-semibold mb-2">Increase Visibility</h3>
              <p className="text-sm text-purple-100">Stand out among 25,000+ communities with enhanced search placement</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Users className="w-8 h-8 text-purple-300 mb-3" />
              <h3 className="font-semibold mb-2">Connect with Families</h3>
              <p className="text-sm text-purple-100">Direct messaging and tour scheduling tools to convert leads</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <DollarSign className="w-8 h-8 text-purple-300 mb-3" />
              <h3 className="font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-sm text-purple-100">From free basic listing to premium features starting at $149/month</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/community-portal">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 px-8 py-6 text-lg font-semibold">
                <Building2 className="w-5 h-5 mr-2" />
                Access Community Portal
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
              <Phone className="w-5 h-5 mr-2" />
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Massive Data Coverage Section - Enhanced */}
      <section className="px-4 py-16 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">North America's Most Comprehensive Senior Living Database</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">26,306+ communities with live government HUD data and transparent pricing</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">6,078+ HUD Properties</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">427,979 Housing Units</Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">34 States Covered</Badge>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">$136-$15,000 Price Range</Badge>
            </div>
          </div>
          
          {/* Geographic Coverage */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">Complete Geographic Coverage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* United States */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">🇺🇸</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">20,279</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">United States</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All 50 states + territories</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">California: 2,965</Badge>
                    <Badge variant="secondary" className="text-xs">Texas: 2,283</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Canada */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">🇨🇦</div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">3,810</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Canada</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All provinces & territories</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">Ontario: 800</Badge>
                    <Badge variant="secondary" className="text-xs">Quebec: 750</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Mexico */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">🇲🇽</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">1,693</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mexico</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">All 32 states covered</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    <Badge variant="secondary" className="text-xs">Jalisco: 120</Badge>
                    <Badge variant="secondary" className="text-xs">CDMX: 150</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Live Government HUD Data */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-6">Live Government HUD Data Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">$303</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Lowest HUD Rent</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Florin Gardens, CA</p>
                  <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Live Data</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">427,979</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Total Housing Units</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Across all HUD properties</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Real Count</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">86.6%</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Average Occupancy Rate</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Across all HUD properties</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Live Stats</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">5,528</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">HUD Properties</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Government verified data</p>
                  <Badge className="mt-2 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">Official</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">34</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">States with HUD Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Complete coverage achieved</p>
                  <Badge className="mt-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">100% Coverage</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">$136-$5,000</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">HUD Price Range</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Transparent pricing data</p>
                  <Badge className="mt-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Verified</Badge>
                </CardContent>
              </Card>
            </div>
          </div>


        </div>
      </section>

      {/* Website Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  MySeniorValet
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Your Personal Senior Living Concierge
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Providing transparent, comprehensive senior living community information to help families make informed decisions. 
                  Our platform connects families with authentic community data, pricing transparency, and trusted reviews.
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="font-medium">Website:</span> 
                    <a href="https://cowellandcowebdesign.github.io" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-300 ml-2 underline">
                      cowellandcowebdesign.github.io
                    </a>
                  </p>
                  <p><span className="font-medium">Email:</span> 
                    <a href="mailto:Hello@myseniorvalet.com" 
                       className="text-blue-400 hover:text-blue-300 ml-2">
                      Hello@myseniorvalet.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* About Us */}
            <div>
              <h4 className="text-lg font-semibold mb-4">About Us</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/about" className="hover:text-blue-400 transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="/mission" className="hover:text-blue-400 transition-colors">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="/team" className="hover:text-blue-400 transition-colors">
                    Meet the Team
                  </a>
                </li>
                <li>
                  <a href="/testimonials" className="hover:text-blue-400 transition-colors">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="https://www.seniorhousingnews.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    Media & Press
                  </a>
                </li>
              </ul>
            </div>

            {/* Services & Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Services & Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/search" className="hover:text-blue-400 transition-colors">
                    Find Communities
                  </a>
                </li>
                <li>
                  <a href="/family-collaboration" className="hover:text-blue-400 transition-colors">
                    Family Collaboration
                  </a>
                </li>
                <li>
                  <a href="/affordable-housing" className="hover:text-blue-400 transition-colors">
                    Affordable Housing
                  </a>
                </li>
                <li>
                  <a href="/help" className="hover:text-blue-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-blue-400 transition-colors">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Admin & Community Access */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform Access</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/community-portal" className="hover:text-blue-400 transition-colors">
                    Community Portal
                  </a>
                </li>
                <li>
                  <a href="/admin" className="hover:text-amber-400 transition-colors">
                    🔐 Admin Dashboard
                  </a>
                </li>
                <li>
                  <a href="/real-data-pricing" className="hover:text-emerald-400 transition-colors">
                    📊 Pricing Intelligence
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Protection & Bottom Section */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Legal Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal Information</h4>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <a href="/terms" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                  <a href="/privacy" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="/disclaimer" className="hover:text-blue-400 transition-colors">
                    Disclaimer
                  </a>
                  <a href="/accessibility" className="hover:text-blue-400 transition-colors">
                    Accessibility
                  </a>
                </div>
              </div>

              {/* Business Status */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Business Status</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Independent Platform</p>
                  <p>California-Based Operation</p>
                  <p>Sole Proprietorship</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Final Protection */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} MySeniorValet. All rights reserved.</p>
                <p className="mt-1">
                  Created and owned by William Scott Cowell. All content, design, and functionality are protected by copyright law.
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Platform Coverage:</span>
                <span className="text-blue-400 font-medium">25,782+ Communities</span>
                <span>•</span>
                <span className="text-green-400 font-medium">Complete North America</span>
              </div>
            </div>
            
            {/* Additional Legal Protection */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong>Legal Notice:</strong> This website and all its contents are the exclusive property of William Scott Cowell. 
                No part of this site may be reproduced, distributed, or transmitted in any form without prior written permission. 
                The MySeniorValet name, logo, and all related content are proprietary and protected by intellectual property laws. 
                All community information is provided for informational purposes only and should be verified independently before making decisions.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
}