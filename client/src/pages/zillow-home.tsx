import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Star, Home } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function ZillowHome() {
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
    <div className="min-h-screen bg-white">
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
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-white">TrueView</span>
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
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Senior Living.
            </h1>
            <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
              Tours. Care. Community.
            </h2>
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
      <section className="px-4 py-6 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trending Communities in Northern California
          </h2>
          <p className="text-gray-600 text-sm">
            Viewed and saved the most in the area over the past 24 hours
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {featuredCommunities.map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-3 left-3 text-white text-xs px-2 py-1 font-medium ${
                      index === 0 ? 'bg-orange-600' : 
                      index === 1 ? 'bg-blue-600' : 
                      index === 2 ? 'bg-green-600' : 'bg-purple-600'
                    }`}
                  >
                    {index === 0 ? '2 hours ago' : 
                     index === 1 ? 'Premium care' :
                     index === 2 ? 'Memory care' : 'New listing'}
                  </Badge>
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
      </section>

      {/* Care Affordability Calculator */}
      <section className="px-4 py-8 bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Find care you can afford with CareAbility™
          </h2>
          <p className="text-gray-600 text-sm">
            See what you could qualify for with our care cost calculator
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">%</span>
            </div>
            <div className="text-xs text-gray-600">Insurance</div>
            <div className="text-sm font-semibold">Coverage</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">$</span>
            </div>
            <div className="text-xs text-gray-600">Monthly</div>
            <div className="text-sm font-semibold">Payment</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-lg">+</span>
            </div>
            <div className="text-xs text-gray-600">Income</div>
            <div className="text-sm font-semibold">Needed</div>
          </div>
        </div>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
          Let's get started
        </Button>
      </section>

      {/* Service Categories */}
      <section className="px-4 py-8 bg-gray-50 space-y-6">
        {/* Find Care */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Find care</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Search communities with pricing transparency and care level matching
                </p>
                <Link href="/search">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Find a community
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Care */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-2xl">$</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Finance care</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Explore insurance options, Medicaid, and long-term care financing
                </p>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Learn more
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Transitions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Plan transitions</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get guidance for moving between care levels and community transitions
                </p>
                <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  Get guidance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* More Featured Communities */}
      <section className="px-4 py-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            More recommended communities
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {communities?.slice(4, 8).map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm">
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