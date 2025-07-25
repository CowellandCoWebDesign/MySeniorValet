
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
  Edit,
  TrendingUp,
  Award,
  Home,
  ChevronRight,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [savedCommunities, setSavedCommunities] = useState<SavedCommunity[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [tourRequests, setTourRequests] = useState<TourRequest[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showIntegrationTools, setShowIntegrationTools] = useState(true);

  // Load real data from API
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/users/${user.id}/dashboard-data`);
        if (response.ok) {
          const data = await response.json();
          setSavedCommunities(data.favorites || []);
          setRecentSearches(data.searchHistory || []);
          setTourRequests(data.tourRequests || []);
        }
      } catch (error) {
        console.error('Error loading user dashboard data:', error);
        // Fallback to empty arrays for clean state
        setSavedCommunities([]);
        setRecentSearches([]);
        setTourRequests([]);
      }
    };
    
    loadUserData();
  }, [user?.id]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 md:p-12 mb-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Home className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Welcome Back!
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  Your personalized senior living dashboard with saved communities, search history, and tour tracking
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6 text-pink-200" />
                  <div>
                    <p className="text-2xl font-bold">{savedCommunities.length}</p>
                    <p className="text-sm text-blue-100">Saved Communities</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Search className="h-6 w-6 text-green-200" />
                  <div>
                    <p className="text-2xl font-bold">{recentSearches.length}</p>
                    <p className="text-sm text-blue-100">Recent Searches</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-yellow-200" />
                  <div>
                    <p className="text-2xl font-bold">{tourRequests.length}</p>
                    <p className="text-sm text-blue-100">Active Tours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-based Navigation */}
            <div className="mt-6 flex flex-wrap gap-4">
              {(user as any)?.role === 'admin' && (
                <Link href="/admin">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                    <Building className="w-5 h-5 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/my-communities">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  <Home className="w-5 h-5 mr-2" />
                  My Communities
                </Button>
              </Link>
              <Link href="/claim">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                  <Plus className="w-5 h-5 mr-2" />
                  Claim a Community
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 h-14 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-2">
              <TabsTrigger value="overview" className="flex items-center space-x-2 h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center space-x-2 h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Heart className="h-4 w-4" />
                <span className="hidden md:inline">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="tours" className="flex items-center space-x-2 h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Tours</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2 h-10 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Integration Tools Showcase */}
            {showIntegrationTools && (
              <Card className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold mb-2">🚀 Advanced Integration Tools</CardTitle>
                      <p className="text-white/90">Enterprise-grade features at your fingertips</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowIntegrationTools(false)}
                      className="text-white hover:bg-white/20"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* AI Analytics */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">📊</span>
                      </div>
                      <h3 className="font-semibold mb-2">AI Analytics</h3>
                      <p className="text-sm text-white/80 mb-3">Market intelligence and predictive insights</p>
                      <Link href="/integrations">
                        <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                          Explore
                        </Button>
                      </Link>
                    </div>

                    {/* Document Management */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">📄</span>
                      </div>
                      <h3 className="font-semibold mb-2">DocuSign</h3>
                      <p className="text-sm text-white/80 mb-3">Digital contract signing and document workflow</p>
                      <Link href="/community-portal">
                        <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                          Sign Docs
                        </Button>
                      </Link>
                    </div>

                    {/* Communication Suite */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">💬</span>
                      </div>
                      <h3 className="font-semibold mb-2">Communications</h3>
                      <p className="text-sm text-white/80 mb-3">Multi-channel messaging and video calls</p>
                      <Link href="/admin">
                        <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                          Message
                        </Button>
                      </Link>
                    </div>

                    {/* Security Dashboard */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">🔒</span>
                      </div>
                      <h3 className="font-semibold mb-2">Security</h3>
                      <p className="text-sm text-white/80 mb-3">Real-time threat monitoring and protection</p>
                      <Link href="/admin">
                        <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                          Monitor
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Link href="/integrations">
                      <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-2xl font-semibold">
                        View All 10+ Enterprise Tools
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <Award className="h-6 w-6" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {recentSearches.slice(0, 3).map((search) => (
                    <div key={search.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{search.query}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{search.location} • {search.results} results</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRepeatSearch(search)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Link href="/search">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl h-12">
                      Start New Search
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <Settings className="h-6 w-6" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Link href="/personalized-dashboard">
                    <Button className="w-full justify-start h-14 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-900 rounded-2xl shadow-md border border-blue-200">
                      <TrendingUp className="h-5 w-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-semibold">Personalized Dashboard</div>
                        <div className="text-sm text-gray-600">AI-powered recommendations</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                    </Button>
                  </Link>
                  
                  <Link href="/tour-tracker">
                    <Button className="w-full justify-start h-14 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-900 rounded-2xl shadow-md border border-green-200">
                      <Calendar className="h-5 w-5 mr-3 text-green-600" />
                      <div className="text-left">
                        <div className="font-semibold">Schedule Tours</div>
                        <div className="text-sm text-gray-600">Visit communities in person</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                    </Button>
                  </Link>
                  
                  <Link href="/family-collaboration">
                    <Button className="w-full justify-start h-14 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 text-gray-900 rounded-2xl shadow-md border border-orange-200">
                      <Users className="h-5 w-5 mr-3 text-orange-600" />
                      <div className="text-left">
                        <div className="font-semibold">Family Sharing</div>
                        <div className="text-sm text-gray-600">Collaborate with family</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Platform Stats */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Building className="h-6 w-6" />
                  <span>Platform Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">31,023</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Communities</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">49</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">States Covered</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">14</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Service Categories</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">Real</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Government Data</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Communities Tab */}
          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Saved Communities
              </h2>
              <Link href="/search">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 py-3">
                  <Search className="h-4 w-4 mr-2" />
                  Find More Communities
                </Button>
              </Link>
            </div>

            {savedCommunities.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardContent className="p-12 text-center">
                  <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Heart className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Saved Communities Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">Start exploring communities and save your favorites here for easy access</p>
                  <Link href="/search">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-8 py-3">
                      Start Exploring
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedCommunities.map((community) => (
                  <Card key={community.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {community.name}
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-300 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            {community.address}, {community.city}, {community.state}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCommunity(community.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-3 py-1">
                            {community.careType}
                          </Badge>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-3 py-1">
                            {community.priceRange}
                          </Badge>
                          <Badge className={`rounded-full px-3 py-1 ${
                            community.availability === 'Available' 
                              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          }`}>
                            {community.availability}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium text-gray-900 dark:text-white">{community.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Saved {new Date(community.savedDate).toLocaleDateString()}
                          </span>
                        </div>

                        {community.notes && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong className="text-blue-600 dark:text-blue-400">Notes:</strong> {community.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-2">
                          <Link href={`/community/${community.id}`}>
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScheduleTour(community.id, community.name)}
                            className="rounded-xl border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Tour
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareCommunity(community)}
                            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
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

          {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Tour Requests
              </h2>
              <Link href="/tour-tracker">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-6 py-3">
                  <Calendar className="h-4 w-4 mr-2" />
                  Tour Tracker
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {tourRequests.map((tour) => (
                <Card key={tour.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tour.communityName}</h3>
                        <div className="space-y-2">
                          <p className="text-gray-600 dark:text-gray-300 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-green-500" />
                            Requested Date: {new Date(tour.requestedDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            Contact: {tour.contactPerson}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-purple-500" />
                            {tour.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={`rounded-full px-4 py-2 ${
                            tour.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                            tour.status === 'confirmed' ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' :
                            tour.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' :
                            'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                          }`}
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
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-t-3xl">
                <CardTitle className="text-2xl font-bold flex items-center space-x-3">
                  <User className="h-7 w-7" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter preferred location"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-8 py-3">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3">
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
