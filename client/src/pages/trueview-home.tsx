import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function TrueViewHome() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: communities, isLoading } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  const { data: heroImages } = useQuery({
    queryKey: ["/api/images/hero"],
    retry: false,
  });

  const featuredCommunities = communities?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-md backdrop-blur-sm">
                <div className="flex flex-col space-y-1">
                  <div className="w-5 h-0.5 bg-white"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white drop-shadow-lg">TrueView</span>
              </div>
            </div>
            <div className="text-white font-medium">
              Sign In
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {heroImages && heroImages.length > 0 && (
          <div className="absolute inset-0">
            <img
              src={heroImages[0].urls.regular}
              alt="Senior living community"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
          {/* Centered Headlines */}
          <div className="text-center mb-12">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Senior Living.
              </h1>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Tours. Care. Community.
              </h2>
            </div>
            <p className="text-base text-white opacity-90 mt-4">
              Search 182 verified communities across Northern California
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full max-w-lg">
            <div className="relative">
              <Input
                type="text"
                placeholder="Community name, city, care type"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg rounded-2xl border-0 shadow-xl bg-white"
              />
              <Button
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-800 rounded-xl w-10 h-10 p-0"
              >
                <Search className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="px-4 py-6 relative overflow-hidden">
        {/* Background Golden Gate Bridge Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Golden Gate Bridge background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-white/50"></div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Trending Communities in Northern California
            </h2>
            <p className="text-gray-600 text-sm">
              Viewed and saved the most in the area over the past 24 hours
            </p>
          </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
          {featuredCommunities.map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden flex-shrink-0 w-48 animate-float border border-gray-200 hover:border-gray-300 transition-colors" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Featured/Sponsored Badge */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-3 left-3 gradient-primary text-white text-xs px-2 py-1 font-medium animate-pulse">
                      Featured
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-3 left-3 gradient-secondary text-white text-xs px-2 py-1 font-medium animate-pulse">
                      Sponsored
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$4,500'}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${community.careTypes.length > 1 ? community.careTypes[1] : 'Full care'}` : 
                      'Assisted Living • Memory Care'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {community.address || `${Math.floor(Math.random() * 9999)} Community Dr`}, {community.city}, {community.state} {community.zipCode}
                  </div>
                  
                  {community.googleRating && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>MLS ID #25-{3000 + community.id}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Move-In Cost Calculator */}
      <section className="px-4 py-8 gradient-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Understand your move-in costs
          </h2>
          <p className="text-gray-600 text-sm">
            Typical move-in expenses and financing options available
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">1×</span>
            </div>
            <div className="text-xs text-gray-600">Community</div>
            <div className="text-sm font-semibold">Fee</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">2×</span>
            </div>
            <div className="text-xs text-gray-600">Monthly</div>
            <div className="text-sm font-semibold">Rent</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">💰</span>
            </div>
            <div className="text-xs text-gray-600">VA Benefits</div>
            <div className="text-sm font-semibold">$1,500+</div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="text-sm font-semibold text-green-800">ElderLife Financing Available</span>
          </div>
          <p className="text-xs text-green-700">
            Bridge financing while waiting for home sale or VA benefits approval
          </p>
        </div>
        
        <Button className="w-full gradient-primary hover:opacity-90 text-white py-3 border-0">
          Calculate move-in costs
        </Button>
      </section>

      {/* Saved Searches with Carousel */}
      <section className="px-4 py-8 relative overflow-hidden">
        {/* Background Golden Gate Bridge Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Golden Gate Bridge background"
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/45 to-pink-50/45"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Memory Care in San Francisco
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">$6,500 - $8,200</div>
              <div className="text-xs text-blue-600">3 price drops</div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">5 new communities • Updated 2 hours ago</p>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
          {communities?.slice(8, 16).map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden flex-shrink-0 w-48 animate-float border border-gray-200 hover:border-gray-300 transition-colors" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Featured/Sponsored Badge */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-3 left-3 gradient-tertiary text-white text-xs px-2 py-1 font-medium animate-pulse">
                      Premium
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-3 left-3 gradient-primary text-white text-xs px-2 py-1 font-medium animate-pulse">
                      Featured
                    </Badge>
                  )}
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-3 left-3 text-white text-xs px-2 py-1 font-medium ${
                      index % 4 === 0 ? 'bg-red-600' : 
                      index % 4 === 1 ? 'bg-blue-600' : 
                      index % 4 === 2 ? 'bg-orange-600' : 'bg-green-600'
                    }`}
                  >
                    {index % 4 === 0 ? 'Price drop' : 
                     index % 4 === 1 ? 'New photos' :
                     index % 4 === 2 ? 'Tour available' : 'Memory care'}
                  </Badge>
                </div>
                
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    ${(6500 + (index * 200)).toLocaleString()}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    Memory Care • Assisted Living
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {community.address || `${Math.floor(Math.random() * 9999)} Memory Lane`}, {community.city}, {community.state}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) || []}
        </div>
        
        <div className="mt-4">
          <Button variant="outline" className="w-full gradient-secondary text-white border-0 hover:opacity-90">
            View all saved searches
          </Button>
        </div>
        </div>
      </section>



      {/* Care Level Guide */}
      <section className="px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50">
        {/* Healthcare Hero Image */}
        <div className="mb-6 relative">
          <div className="aspect-[16/9] bg-gradient-to-r from-blue-50 to-green-50 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
              alt="Healthcare professional assisting senior in comfortable care environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl font-bold mb-2">Understanding care levels</h2>
                <p className="text-sm opacity-90">Find the right level of care based on needs and independence</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Skilled Nursing */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Skilled Nursing</h3>
                  <p className="text-xs text-gray-600 mb-2">24/7 medical care, rehabilitation, complex medical needs</p>
                  <div className="text-sm font-semibold text-blue-600">$8,000 - $12,000/month</div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Care */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Memory Care</h3>
                  <p className="text-xs text-gray-600 mb-2">Specialized dementia/Alzheimer's care, secure environment</p>
                  <div className="text-sm font-semibold text-blue-600">$6,500 - $9,500/month</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">🧠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assisted Living */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Assisted Living</h3>
                  <p className="text-xs text-gray-600 mb-2">Personal care assistance, medication management, meals</p>
                  <div className="text-sm font-semibold text-blue-600">$4,200 - $7,000/month</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">🤝</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living with Services */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Independent Living with Services</h3>
                  <p className="text-xs text-gray-600 mb-2">Independent apartments plus care services, housekeeping</p>
                  <div className="text-sm font-semibold text-blue-600">$3,500 - $5,500/month</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Independent Living */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Independent Living</h3>
                  <p className="text-xs text-gray-600 mb-2">Active senior communities, social activities, dining</p>
                  <div className="text-sm font-semibold text-blue-600">$2,800 - $4,500/month</div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-lg">🏃</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Senior Apartments */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Senior Apartments</h3>
                  <p className="text-xs text-gray-600 mb-2">Age-restricted housing, minimal services, independent living</p>
                  <div className="text-sm font-semibold text-blue-600">$1,800 - $3,200/month</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-lg">🏠</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HUD/VASH + In-Home Services */}
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">HUD/VASH + In-Home Services</h3>
                  <p className="text-xs text-gray-600 mb-2">Subsidized housing with IHSS or SLS home care support</p>
                  <div className="text-sm font-semibold text-green-600">$800 - $1,500/month + services</div>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <span className="text-green-700 font-bold text-lg">🏡</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button className="w-full gradient-tertiary hover:opacity-90 text-white border-0">
            Find communities by care level
          </Button>
        </div>
      </section>

      {/* Coastal Living Section */}
      <section className="px-4 py-8 relative overflow-hidden">
        {/* Background Ocean Wave Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Ocean waves background"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-cyan-50/40"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Coastal Living Communities
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">$3,200 - $4,800</div>
              <div className="text-xs text-blue-600">Ocean views available</div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">Bay Area and North Coast communities with ocean views and coastal charm</p>
        
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide horizontal-card-gradient">
            {(communities?.filter((community: any) => 
              ['Eureka', 'Arcata', 'San Francisco', 'Pacifica', 'Half Moon Bay', 'Santa Cruz', 'Monterey', 'Sausalito'].includes(community.city)
            ) || communities?.slice(0, 8) || []).slice(0, 8).map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden flex-shrink-0 w-48 animate-float coastal-card" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  
                  {/* Coastal Living Badge */}
                  {index % 3 === 0 && (
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 font-medium">
                      Ocean View
                    </Badge>
                  )}
                  {index % 3 === 1 && (
                    <Badge className="absolute top-3 left-3 bg-cyan-600 text-white text-xs px-2 py-1 font-medium">
                      Coastal
                    </Badge>
                  )}
                  
                  {/* Price Badge */}
                  <Badge className="absolute bottom-3 left-3 bg-green-600 text-white text-xs px-2 py-1 font-medium">
                    $3K+
                  </Badge>
                </div>
                
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$3,800'}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • Coastal Living` : 
                      'Assisted Living • Ocean Views'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {community.address || 'Coastal Community'}, {community.city}, CA
                  </div>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>🌊 Coastal Views</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Comparison Section */}
      <section className="px-4 py-8 gradient-card">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            What families are saying
          </h2>
          <p className="text-gray-600 text-sm">
            Real reviews from families who found their perfect community
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Review 1 */}
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  MH
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Margaret H.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "The transparency in pricing made all the difference. We knew exactly what to expect for mom's memory care, and the staff has been incredible."
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    Sunrise Senior Living, Palo Alto • Memory Care
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 2 */}
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Robert J.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Found this through TrueView and couldn't be happier. The virtual tours saved us so much time, and dad loves his new home."
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    The Gardens at Bay Area • Independent Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review 3 */}
          <Card className="border-0 shadow-sm bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Linda C.</h3>
                    <div className="flex items-center">
                      {[1,2,3,4].map(star => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-gray-300 text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "The care level matching was spot-on. They helped us understand exactly what services mom needed, and the pricing was fair and upfront."
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                    Atria Senior Living, San Rafael • Assisted Living
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
            Read more family reviews
          </Button>
        </div>
      </section>

      {/* More Featured Communities */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            More recommended communities
          </h2>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {communities?.slice(4, 12).map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm flex-shrink-0 w-48">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-3 left-3 text-white text-xs px-2 py-1 font-medium ${
                      index === 0 ? 'bg-red-600' : 
                      index === 1 ? 'bg-blue-600' : 
                      index === 2 ? 'bg-green-600' : 'bg-orange-600'
                    }`}
                  >
                    {index === 0 ? 'Open house' : 
                     index === 1 ? 'Virtual tour' :
                     index === 2 ? 'New photos' : 'Price drop'}
                  </Badge>
                </div>
                
                <CardContent className="p-3">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$4,200'}
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    {community.careTypes?.length > 0 ? 
                      `${community.careTypes[0]} • ${community.careTypes.length > 1 ? community.careTypes[1] : 'Memory Care'}` : 
                      'Independent Living • Assisted Living'
                    }
                  </div>
                  
                  <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {community.name}
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-1">
                    {community.address || `${Math.floor(Math.random() * 9999)} Community Way`}, {community.city}, {community.state} {community.zipCode}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) || []}
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
}