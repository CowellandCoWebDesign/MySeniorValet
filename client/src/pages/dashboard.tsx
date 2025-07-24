import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Settings, 
  User, 
  Bell, 
  Search,
  Star,
  Phone,
  Mail,
  Share2,
  Download,
  Eye,
  BookmarkPlus,
  MessageCircle,
  Building,
  DollarSign,
  Clock,
  Users,
  Trash2,
  Edit
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface SavedCommunity {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  priceRange: string;
  careType: string;
  rating: number;
  availability: string;
  savedDate: string;
  notes?: string;
}

interface RecentSearch {
  id: string;
  query: string;
  location: string;
  results: number;
  date: string;
}

interface TourRequest {
  id: string;
  communityName: string;
  requestedDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  contactPerson: string;
  phone: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [savedCommunities, setSavedCommunities] = useState<SavedCommunity[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [tourRequests, setTourRequests] = useState<TourRequest[]>([]);
  const [activeTab, setActiveTab] = useState("saved");

  // Load sample data on mount
  useEffect(() => {
    // Sample saved communities
    setSavedCommunities([
      {
        id: 30789,
        name: "FLORIN GARDENS APARTMENTS COOPERATIVE",
        address: "7727 Florin Mall Dr",
        city: "Sacramento",
        state: "CA",
        priceRange: "$303/month",
        careType: "Independent Living",
        rating: 4.2,
        availability: "Available",
        savedDate: "2025-01-06",
        notes: "Good pricing, close to family"
      },
      {
        id: 800067910,
        name: "SACRAMENTO ELDERLY APARTMENTS",
        address: "1325 Auburn Blvd",
        city: "Sacramento", 
        state: "CA",
        priceRange: "$355/month",
        careType: "Senior Housing",
        rating: 4.0,
        availability: "Waitlist",
        savedDate: "2025-01-05"
      }
    ]);

    // Sample recent searches
    setRecentSearches([
      {
        id: "1",
        query: "Memory Care",
        location: "Sacramento, CA",
        results: 126,
        date: "2025-01-06"
      },
      {
        id: "2", 
        query: "Assisted Living under $4000",
        location: "California",
        results: 1000,
        date: "2025-01-05"
      }
    ]);

    // Sample tour requests
    setTourRequests([
      {
        id: "1",
        communityName: "FLORIN GARDENS APARTMENTS COOPERATIVE",
        requestedDate: "2025-01-10",
        status: "pending",
        contactPerson: "Maria Rodriguez",
        phone: "(916) 555-0123"
      }
    ]);
  }, []);

  const handleRemoveCommunity = (id: number) => {
    setSavedCommunities(prev => prev.filter(community => community.id !== id));
    toast({
      title: "Community Removed",
      description: "Community has been removed from your saved list.",
    });
  };

  const handleShareCommunity = (community: SavedCommunity) => {
    const shareText = `Check out ${community.name} in ${community.city}, ${community.state} - ${community.priceRange}`;
    if (navigator.share) {
      navigator.share({
        title: community.name,
        text: shareText,
        url: `${window.location.origin}/community/${community.id}`
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.origin}/community/${community.id}`);
      toast({
        title: "Link Copied",
        description: "Community link has been copied to clipboard.",
      });
    }
  };

  const handleScheduleTour = (communityId: number, communityName: string) => {
    const newTour: TourRequest = {
      id: Date.now().toString(),
      communityName,
      requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      contactPerson: "Tour Coordinator",
      phone: "Contact via platform"
    };

    setTourRequests(prev => [...prev, newTour]);
    toast({
      title: "Tour Request Submitted",
      description: `Tour request for ${communityName} has been submitted.`,
    });
  };

  const handleRepeatSearch = (search: RecentSearch) => {
    // Redirect to search with parameters
    window.location.href = `/search?q=${encodeURIComponent(search.query)}&location=${encodeURIComponent(search.location)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Senior Living Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track your saved communities, searches, and tour requests all in one place
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{savedCommunities.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Saved Communities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentSearches.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Recent Searches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{tourRequests.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tour Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                  <Eye className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">31,023</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Communities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-lg">
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Saved Communities</span>
            </TabsTrigger>
            <TabsTrigger value="searches" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Recent Searches</span>
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Tour Requests</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Saved Communities Tab */}
          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Saved Communities</h2>
              <Link href="/search">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  Find More Communities
                </Button>
              </Link>
            </div>

            {savedCommunities.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Saved Communities</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Start exploring communities and save your favorites here</p>
                  <Link href="/search">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Start Exploring
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedCommunities.map((community) => (
                  <Card key={community.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                            {community.name}
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {community.address}, {community.city}, {community.state}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCommunity(community.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{community.careType}</Badge>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                            {community.priceRange}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            {community.availability}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{community.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Saved on {new Date(community.savedDate).toLocaleDateString()}
                          </span>
                        </div>

                        {community.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <strong>Notes:</strong> {community.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Link href={`/community/${community.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleTour(community.id, community.name)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule Tour
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareCommunity(community)}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent Searches Tab */}
          <TabsContent value="searches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Searches</h2>
              <Link href="/search">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Search className="h-4 w-4 mr-2" />
                  New Search
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentSearches.map((search) => (
                <Card key={search.id} className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{search.query}</h3>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {search.location}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {search.results} results • {new Date(search.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRepeatSearch(search)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Repeat Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tour Requests Tab */}
          <TabsContent value="tours" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Requests</h2>
              <Link href="/tour-tracker">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Tour Tracker
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {tourRequests.map((tour) => (
                <Card key={tour.id} className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{tour.communityName}</h3>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Requested Date: {new Date(tour.requestedDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          Contact: {tour.contactPerson}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-1" />
                          {tour.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={
                            tour.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            tour.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            tour.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter preferred location"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}