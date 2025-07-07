import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Home, 
  MapPin, 
  Star,
  Calendar,
  Bell,
  Search,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";

interface SavedSearch {
  id: number;
  name: string;
  query: string;
  location: string;
  newResults: number;
  totalResults: number;
  lastUpdate: string;
  priceAlerts?: {
    type: 'decrease' | 'increase';
    amount: number;
    date: string;
  }[];
}

interface CommunityUpdate {
  id: number;
  communityId: number;
  communityName: string;
  address: string;
  city: string;
  state: string;
  updateType: 'price_cut' | 'new_availability' | 'virtual_tour' | 'open_house';
  oldPrice?: number;
  newPrice?: number;
  savings?: number;
  date: string;
  photo?: string;
}

export default function UpdatesTab() {

  // Mock data - in real app this would come from API
  const savedSearches: SavedSearch[] = [
    {
      id: 1,
      name: "Assisted Living in Bay Area",
      query: "assisted living",
      location: "San Francisco, CA",
      newResults: 5,
      totalResults: 23,
      lastUpdate: "2 hours ago",
      priceAlerts: [
        { type: 'decrease', amount: 500, date: '7/1' }
      ]
    },
    {
      id: 2,
      name: "Memory Care near Redding",
      query: "memory care",
      location: "Redding, CA 96003",
      newResults: 7,
      totalResults: 12,
      lastUpdate: "1 day ago"
    }
  ];

  const communityUpdates: CommunityUpdate[] = [
    {
      id: 1,
      communityId: 274,
      communityName: "The Sequoias San Francisco",
      address: "1400 Geary Blvd",
      city: "San Francisco",
      state: "CA",
      updateType: 'price_cut',
      oldPrice: 7500,
      newPrice: 6500,
      savings: 1000,
      date: "7/1",
      photo: "/api/placeholder/200/150"
    },
    {
      id: 2,
      communityId: 262,
      communityName: "Brookdale Redding",
      address: "2125 Larkspur Lane",
      city: "Redding",
      state: "CA",
      updateType: 'new_availability',
      date: "6/30"
    },
    {
      id: 3,
      communityId: 275,
      communityName: "Heritage Manor",
      address: "1525 Pine Street",
      city: "Eureka",
      state: "CA",
      updateType: 'virtual_tour',
      date: "6/29"
    }
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'price_cut':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'new_availability':
        return <Home className="w-4 h-4 text-blue-600" />;
      case 'virtual_tour':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getUpdateBadge = (type: string) => {
    switch (type) {
      case 'price_cut':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Price cut</Badge>;
      case 'new_availability':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">New availability</Badge>;
      case 'virtual_tour':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Virtual tour</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Update</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Updates</h1>
      </div>

      {/* Saved Searches Section */}
      <div className="bg-white mb-4">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Saved searches</h2>
            <Button variant="ghost" className="text-blue-600 text-sm">
              Mark all as viewed
            </Button>
          </div>

          <div className="space-y-4">
            {savedSearches.map((search) => (
              <Card key={search.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{search.name}</h3>
                        {search.newResults > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                            {search.newResults}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        For {search.query}, {search.location}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Search className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  {/* Recent Updates */}
                  {search.priceAlerts && search.priceAlerts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {search.priceAlerts.map((alert, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">
                            Price cut: ${alert.amount} ({alert.date})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sample Properties */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative">
                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <Home className="w-6 h-6 text-gray-400" />
                        </div>
                        {i === 1 && (
                          <Badge className="absolute top-1 left-1 bg-orange-600 text-white text-xs px-1 py-0.5">
                            Price cut: ${search.priceAlerts?.[0]?.amount}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Updates Section */}
      <div className="bg-white">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent updates</h2>

          <div className="space-y-4">
            {communityUpdates.map((update) => (
              <Link key={update.id} href={`/community/${update.communityId}`}>
                <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      {/* Photo */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <Home className="w-6 h-6 text-gray-400" />
                        </div>
                        {update.updateType === 'price_cut' && update.savings && (
                          <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 py-0.5">
                            -{update.savings}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              {getUpdateIcon(update.updateType)}
                              {getUpdateBadge(update.updateType)}
                            </div>
                            
                            {update.updateType === 'price_cut' && (
                              <div className="text-sm text-gray-900 mb-1">
                                <span className="line-through text-gray-500">
                                  ${update.oldPrice?.toLocaleString()}
                                </span>
                                <span className="ml-2 font-semibold text-green-700">
                                  ${update.newPrice?.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{update.date}</span>
                        </div>

                        <h3 className="font-medium text-gray-900 mb-1">
                          {update.communityName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{update.address}, {update.city}, {update.state}</span>
                        </div>

                        {update.updateType === 'price_cut' && update.savings && (
                          <div className="mt-2 text-sm text-green-700 font-medium">
                            Save ${update.savings}/month
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* More Updates */}
          <div className="mt-6 text-center">
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Load more updates
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
}