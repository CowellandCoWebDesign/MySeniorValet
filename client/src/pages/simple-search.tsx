import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Home,
  List,
  Map,
  Bell,
  Calendar,
  Mail
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function SimpleSearch() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [activeTab, setActiveTab] = useState('search');

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) setSearchQuery(q);
  }, [location]);

  const { data: communities, isLoading } = useQuery({
    queryKey: ["/api/communities"],
    retry: false,
  });

  console.log('SimpleSearch - communities:', communities?.length, 'loading:', isLoading);

  const filteredCommunities = communities?.filter((community: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      community.name?.toLowerCase().includes(query) ||
      community.city?.toLowerCase().includes(query) ||
      community.careTypes?.some((type: string) => type.toLowerCase().includes(query))
    );
  }) || [];

  // Bottom Navigation
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center py-2">
        {[
          { id: 'search', label: 'Search', icon: Search },
          { id: 'updates', label: 'Updates', icon: Bell, badge: 31 },
          { id: 'saved', label: 'Saved', icon: Heart },
          { id: 'tours', label: 'Tours', icon: Calendar },
          { id: 'inbox', label: 'Inbox', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2 min-w-0 flex-1 ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-0.5 truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (activeTab !== 'search') {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {activeTab === 'updates' && 'Updates'}
              {activeTab === 'saved' && 'Saved Communities'}
              {activeTab === 'tours' && 'Tours'}
              {activeTab === 'inbox' && 'Messages'}
            </h2>
            <p className="text-gray-600 mb-4">Coming soon...</p>
            <Button 
              onClick={() => setActiveTab('search')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Search
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white z-30 border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Senior living communities, city, region"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-3 flex space-x-3">
          <Button variant="outline" className="border-blue-600 text-blue-600">
            Care Level
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600">
            $2K - $6K
          </Button>
        </div>
      </div>

      {/* Map/List View */}
      {viewMode === 'map' ? (
        <div className="h-96 bg-green-50 relative overflow-hidden">
          {/* Detailed California Map Background */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 400 300" className="bg-blue-50">
              {/* California coastline shape */}
              <path 
                d="M40 60 Q60 50 80 55 L85 70 Q90 85 95 100 L100 120 Q105 140 110 160 L115 180 Q120 200 125 220 L130 240 Q135 250 140 260 L145 270 Q150 280 160 285 L180 290 Q200 285 220 280 L240 275 Q260 270 280 260 L300 250 Q320 240 340 220 L360 200 Q380 180 390 160 L395 140 Q390 120 385 100 L380 80 Q375 60 370 40 L365 20 Q360 10 350 5 L330 10 Q310 15 290 20 L270 25 Q250 30 230 35 L210 40 Q190 45 170 50 L150 55 Q130 58 110 60 L90 62 Q70 61 50 60 Z" 
                fill="#e0f2fe" 
                stroke="#0284c7" 
                strokeWidth="1"
                opacity="0.6"
              />
              
              {/* Mountain ranges */}
              <path 
                d="M120 100 Q140 80 160 85 L180 90 Q200 85 220 90 L240 95 Q260 90 280 95 L300 100" 
                fill="none" 
                stroke="#16a34a" 
                strokeWidth="2" 
                opacity="0.4"
              />
              
              {/* Major highways */}
              <path d="M100 120 Q200 140 300 120" stroke="#6b7280" strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M80 180 Q180 200 280 180" stroke="#6b7280" strokeWidth="2" fill="none" opacity="0.5" />
              
              {/* Bay Area water */}
              <circle cx="100" cy="150" r="15" fill="#3b82f6" opacity="0.3" />
              
              {/* Cities labels */}
              <text x="100" y="145" fontSize="8" fill="#374151" textAnchor="middle">SF</text>
              <text x="180" y="120" fontSize="8" fill="#374151" textAnchor="middle">Sacramento</text>
              <text x="80" y="80" fontSize="8" fill="#374151" textAnchor="middle">Eureka</text>
              <text x="200" y="60" fontSize="8" fill="#374151" textAnchor="middle">Redding</text>
            </svg>
          </div>

          {/* Community Pins */}
          <div className="absolute inset-0">
            {filteredCommunities.slice(0, 15).map((community: any, index: number) => {
              // Create more realistic positions for Northern California
              const positions = [
                { left: '25%', top: '40%' }, // San Francisco
                { left: '30%', top: '45%' }, // Oakland
                { left: '35%', top: '50%' }, // San Jose
                { left: '45%', top: '35%' }, // Sacramento
                { left: '20%', top: '20%' }, // Eureka
                { left: '22%', top: '22%' }, // Arcata
                { left: '50%', top: '15%' }, // Redding
                { left: '40%', top: '40%' }, // Santa Rosa
                { left: '55%', top: '60%' }, // Stockton
                { left: '28%', top: '48%' }, // Fremont
                { left: '26%', top: '42%' }, // Berkeley
                { left: '32%', top: '47%' }, // Richmond
                { left: '24%', top: '25%' }, // Fort Bragg
                { left: '42%', top: '45%' }, // Napa
                { left: '38%', top: '48%' }, // Vallejo
              ];
              
              const position = positions[index] || { 
                left: `${25 + (index % 6) * 10}%`, 
                top: `${25 + Math.floor(index / 6) * 15}%` 
              };
              
              return (
                <div
                  key={community.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={position}
                  onClick={() => window.location.href = `/community/${community.id}`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-125 transition-all duration-200 hover:bg-blue-700">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Popup on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-white rounded-lg shadow-xl p-3 min-w-[200px] border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{community.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{community.city}, {community.state}</p>
                        {community.monthlyRent && (
                          <p className="text-base font-bold text-blue-600 mb-1">
                            ${community.monthlyRent.toLocaleString()}/mo
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                        </p>
                        {community.googleRating && (
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span className="text-xs text-gray-600">{community.googleRating} ({community.googleReviewCount || 0} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Price badge */}
                    {community.monthlyRent && (
                      <div className="absolute -bottom-1 -right-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded text-center min-w-[32px]">
                        ${Math.floor(community.monthlyRent / 1000)}K
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className="bg-white shadow-md"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          {/* Results Counter */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="text-center py-4">
              <div className="text-lg font-semibold text-gray-900">
                {filteredCommunities.length} results
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                {filteredCommunities.length} results
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
            </div>
          </div>

          {/* Communities List */}
          <div className="space-y-4">
            {filteredCommunities.map((community: any, index: number) => (
              <Link key={community.id} href={`/community/${community.id}`}>
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      {community.photos && community.photos.length > 0 ? (
                        <img 
                          src={community.photos[0]} 
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <button className="p-1 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm">
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </button>
                      </div>

                      {index % 4 === 0 && (
                        <Badge className="absolute top-2 left-2 bg-orange-600 text-white px-1.5 py-0.5 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xl font-bold text-gray-900">
                          {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : 'Contact for pricing'}
                        </div>
                        {community.googleRating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium">{community.googleRating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {community.careTypes?.slice(0, 2).join(' • ') || 'Senior Living'}
                      </div>
                      
                      <div className="text-base font-medium text-gray-900 mb-2">
                        {community.name}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{community.city}, {community.state}</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}