import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, MapPin, Filter, Star, Home, TrendingUp, User, Settings } from "lucide-react";
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TrueView</span>
            </div>
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">2</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100">
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
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Senior Living.
            </h1>
            <h2 className="text-4xl font-bold text-white mb-2">
              Tours. Care. Community.
            </h2>
            <p className="text-white text-lg opacity-90">
              Find the perfect senior living community
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Care type, location, community name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg border-0 shadow-lg text-lg"
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Pills */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex space-x-3 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Care type (1)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            $3K or less
          </Button>
        </div>
      </div>

      {/* Trending Section */}
      <section className="px-4 py-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Trending Communities in Northern California
          </h2>
          <Link href="/search">
            <Button variant="link" className="text-blue-600 p-0">
              See all
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {featuredCommunities.map((community: any) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <Home className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </div>
                  </div>
                  {community.monthlyRent && (
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs px-1.5 py-1">
                      ${Math.floor(community.monthlyRent / 1000)}K+
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : 'Contact for pricing'}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {community.careTypes?.slice(0, 1).join('') || 'Senior Living'}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">
                    {community.name}
                  </div>
                  <div className="flex items-center text-xs text-gray-600 mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{community.city}, {community.state}</span>
                  </div>
                  {community.googleRating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs text-gray-600">
                        {community.googleRating} ({community.googleReviewCount})
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 bg-white">
        <div className="space-y-6">
          {/* Find Communities */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Find a community</h3>
                  <p className="text-sm text-gray-600">
                    Search with transparent pricing and live availability
                  </p>
                </div>
              </div>
              <Link href="/search">
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Start searching
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Get Recommendations */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Get personalized recommendations</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered matching based on care needs and preferences
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-green-600 text-green-600 hover:bg-green-50">
                Get recommendations
              </Button>
            </CardContent>
          </Card>

          {/* Tour Communities */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule tours</h3>
                  <p className="text-sm text-gray-600">
                    Book visits and connect with care coordinators
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 border-purple-600 text-purple-600 hover:bg-purple-50">
                Find tours
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/search">
            <div className="flex flex-col items-center py-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium mt-1">Search</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Updates</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Saved</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Tours</span>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center py-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">More</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Bottom spacing for fixed nav */}
      <div className="h-16"></div>
    </div>
  );
}