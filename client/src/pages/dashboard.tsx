import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  Bell, 
  FileText,
  TrendingUp,
  Activity,
  Mail,
  Shield,
  HelpCircle,
  LogOut,
  Home,
  DollarSign,
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  Camera,
  Plus,
  Edit,
  BarChart3,
  PieChart,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Share2,
  Bookmark,
  Download,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Users,
  Building,
  Sparkles,
  Award,
  TrendingDown
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { CommunityCard } from "@/components/community-card";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const mockFavoriteCommunities = [
  {
    id: 274,
    name: "The Sequoias San Francisco",
    address: "1400 Geary Blvd",
    city: "San Francisco",
    state: "CA",
    careTypes: ["Independent Living", "Assisted Living"],
    photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop"],
    availabilityStatus: "Immediate Availability",
    savedDate: "2024-01-03"
  },
  {
    id: 275,
    name: "Heritage on the Marina",
    address: "3400 Laguna St",
    city: "San Francisco", 
    state: "CA",
    careTypes: ["Independent Living"],
    photos: ["https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop"],
    availabilityStatus: "Limited Availability",
    savedDate: "2024-01-02"
  }
];

const mockSearchAlerts = [
  {
    id: 1,
    name: "San Francisco Independent Living",
    criteria: "Independent Living in San Francisco, CA under $6,000/month",
    newMatches: 3,
    lastAlert: "2 hours ago"
  },
  {
    id: 2,
    name: "Bay Area Memory Care",
    criteria: "Memory Care within 25 miles of Oakland, CA",
    newMatches: 1,
    lastAlert: "1 day ago"
  }
];

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'availability'>('recent');
  const { user, isLoading, isAuthenticated } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get tab from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'favorites');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation, toast]);

  // Fetch user favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch user search history
  const { data: searchHistory = [] } = useQuery({
    queryKey: ["/api/search-history"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch user tours
  const { data: tours = [] } = useQuery({
    queryKey: ["/api/tours"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.community?.name?.localeCompare(b.community?.name || '') || 0;
      case 'availability':
        return (a.community?.availabilityStatus || '').localeCompare(b.community?.availabilityStatus || '');
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated) {
    return null; // Redirect will handle this
  }

  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                TrueView
              </Link>
              <div className="hidden md:block">
                <span className="text-gray-500">•</span>
                <span className="text-gray-700 ml-2">My Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {userInitials}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {userDisplayName}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* WELCOME SECTION */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
                <p className="text-blue-100">Your personalized senior living community dashboard</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{favorites.length}</div>
                    <div className="text-sm text-blue-100">Saved Communities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD OVERVIEW STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-900">Favorites</CardTitle>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-1">{favorites.length}</div>
              <p className="text-sm text-green-700">Communities saved</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-900">Tours</CardTitle>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-1">{tours.length}</div>
              <p className="text-sm text-purple-700">Visits tracked</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-900">Search History</CardTitle>
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-md">
                <Search className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 mb-1">{searchHistory.length}</div>
              <p className="text-sm text-orange-700">Recent searches</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-indigo-900">Progress</CardTitle>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900 mb-1">75%</div>
              <p className="text-sm text-indigo-700">Search complete</p>
            </CardContent>
          </Card>
        </div>

        {/* DASHBOARD TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Tours</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Search Analytics</h2>
                <p className="text-gray-600">Track your community exploration progress and insights</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Search Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Communities Viewed</span>
                        <span className="font-medium">28/50</span>
                      </div>
                      <Progress value={56} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tours Completed</span>
                        <span className="font-medium">{tours.length}/10</span>
                      </div>
                      <Progress value={tours.length * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Research Complete</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <span>Care Type Interest</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Independent Living</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-16 h-full bg-blue-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">80%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assisted Living</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-12 h-full bg-green-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Care</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="w-8 h-full bg-orange-500"></div>
                        </div>
                        <span className="text-sm text-gray-600">40%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Viewed Heritage Hills</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Saved Sequoias SF</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Searched Bay Area</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-red-600" />
                    <span>Next Steps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Create favorites list</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Schedule 3 more tours</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Compare pricing options</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Explorer</p>
                        <p className="text-xs text-gray-500">Saved 5+ communities</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Researcher</p>
                        <p className="text-xs text-gray-500">Visited 3+ communities</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAVORITES TAB */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Favorite Communities</h2>
                <p className="text-gray-600">Communities you've saved for future reference</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-white rounded-lg border p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="recent">Recently Added</option>
                  <option value="name">Name A-Z</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>

            {sortedFavorites.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
                {sortedFavorites.map((favorite) => (
                  <div key={favorite.id} className="relative">
                    <CommunityCard community={favorite.community as any} />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring communities and save your favorites</p>
                  <Link href="/search">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Communities
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ALERTS TAB */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Smart Search Alerts</h2>
                <p className="text-gray-600">Get notified when communities match your criteria and preferences</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Alerts
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSearchAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{alert.name}</span>
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            {alert.newMatches} new
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{alert.criteria}</p>
                      </div>
                      <Badge variant="secondary" className="text-blue-600">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Last alert: {alert.lastAlert}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Daily frequency</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Create New Alert</h3>
                  <p className="text-gray-600 text-center mb-4">Get notified when new communities match your search</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Smart Alert Suggestions</h3>
                    <p className="text-gray-600">Based on your search history, we suggest alerts for:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-white">Bay Area Independent Living</Badge>
                      <Badge variant="outline" className="bg-white">Memory Care under $8,000</Badge>
                      <Badge variant="outline" className="bg-white">Pet-friendly communities</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOURS TAB */}
          <TabsContent value="tours" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tours & Visits</h2>
                <p className="text-gray-600">Manage your community visits with comprehensive tour tracking</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href="/tour-tracker">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Tour Tracker
                  </Button>
                </Link>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </div>
            </div>

            {tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <Card key={tour.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tour.communityName}</CardTitle>
                        <Badge variant={tour.status === 'completed' ? 'default' : 'secondary'}>
                          {tour.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(tour.tourDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {tour.tourTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {tour.address}
                        </div>
                        {tour.tourPhotos && tour.tourPhotos.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Camera className="h-4 w-4 mr-2" />
                            {tour.tourPhotos.length} photos
                          </div>
                        )}
                        {tour.overallRating && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 mr-2" />
                            {tour.overallRating}/5 stars
                          </div>
                        )}
                        {tour.notes && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {tour.notes}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t flex space-x-2">
                        <Link href={`/edit-tour/${tour.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours tracked yet</h3>
                  <p className="text-gray-600 mb-6">Start tracking your community visits with photos, notes, and pricing details</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/tour-tracker">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Start Tour Tracker
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button variant="outline">
                        <Search className="h-4 w-4 mr-2" />
                        Find Communities
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* INBOX TAB */}
          <TabsContent value="inbox" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inbox</h2>
              <p className="text-gray-600">Messages and notifications from communities</p>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">Communities you contact will send updates and responses here</p>
                <Link href="/search">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Explore Communities
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Research Notes</h2>
                <p className="text-gray-600">Keep track of your thoughts, impressions, and important details</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Notes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">The Sequoias San Francisco</CardTitle>
                      <p className="text-sm text-gray-600">Independent Living Research</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      <Star className="h-3 w-3 mr-1" />
                      High Priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">
                    Great location on Geary Boulevard. Staff seemed very friendly during phone call. 
                    Need to ask about pet policy and parking availability. Monthly cost around $5,500.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated 2 days ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Heritage on the Marina</CardTitle>
                      <p className="text-sm text-gray-600">Tour Follow-up</p>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Follow-up Needed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">
                    Toured on Monday - beautiful bay views! Dining room was impressive. 
                    Waiting list for studio units. Contact Mary Johnson about availability timeline.
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated 1 day ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Questions for All Communities</CardTitle>
                      <p className="text-sm text-gray-600">General Research</p>
                    </div>
                    <Badge variant="outline" className="text-purple-600">
                      <Bookmark className="h-3 w-3 mr-1" />
                      Reference
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">
                    Key questions to ask: 1) Move-in fees and deposits 2) Pet policies 3) Meal plan flexibility 
                    4) Transportation services 5) Medical care coordination 6) Activity calendar
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated 3 days ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Create New Note</h3>
                  <p className="text-gray-600 text-center mb-4">Add research notes, impressions, or questions</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Family Collaboration</h3>
                    <p className="text-gray-600">Share your notes with family members to get their input on your research</p>
                    <div className="mt-3">
                      <Button variant="outline" className="bg-white">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share with Family
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
              <p className="text-gray-600">Manage your profile and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold border-4 border-blue-200">
                      {userInitials}
                    </div>
                    <div>
                      <h3 className="font-semibold">{userDisplayName}</h3>
                      <p className="text-gray-600">{user?.email}</p>
                      <p className="text-sm text-gray-500">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Search alerts</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Community updates</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Preferences
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Update Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5" />
                    <span>Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}