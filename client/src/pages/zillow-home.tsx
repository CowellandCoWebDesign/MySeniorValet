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
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {featuredCommunities.map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm flex-shrink-0 w-48">
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

      {/* Move-In Cost Calculator */}
      <section className="px-4 py-8 bg-white">
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
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
          Calculate move-in costs
        </Button>
      </section>

      {/* Saved Searches with Carousel */}
      <section className="px-4 py-8 bg-gray-50">
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
        
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {communities?.slice(8, 16).map((community: any, index) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm flex-shrink-0 w-48">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                  
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
          <Button variant="outline" className="w-full text-blue-600 border-blue-600 hover:bg-blue-50">
            View all saved searches
          </Button>
        </div>
      </section>

      {/* Care Level Guide */}
      <section className="px-4 py-8 bg-gray-50">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Understanding care levels
          </h2>
          <p className="text-gray-600 text-sm">
            Find the right level of care based on needs and independence
          </p>
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
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Find communities by care level
          </Button>
        </div>
      </section>

      {/* Reviews Comparison Section */}
      <section className="px-4 py-8 bg-white">
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