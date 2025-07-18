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
  TrendingDown,
  ArrowRight,
  Filter as FilterIcon,
  ExternalLink,
  Zap,
  Timer,
  ThumbsUp,
  Package,
  Briefcase,
  HeartHandshake,
  UserCheck,
  PlayCircle,
  MessageCircle,
  PhoneCall,
  MapPinIcon,
  StarIcon,
  HeartIcon
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { CommunityCard } from "@/components/community-card";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DashboardStats {
  totalSaved: number;
  totalVisited: number;
  totalNotes: number;
  totalShared: number;
  weeklyActivity: number;
  searchAlerts: number;
  tourScheduled: number;
  recentActivity: Array<{
    id: string;
    type: 'saved' | 'visited' | 'shared' | 'note';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

const mockStats: DashboardStats = {
  totalSaved: 12,
  totalVisited: 8,
  totalNotes: 15,
  totalShared: 6,
  weeklyActivity: 24,
  searchAlerts: 3,
  tourScheduled: 2,
  recentActivity: [
    {
      id: '1',
      type: 'saved',
      title: 'Saved The Sequoias San Francisco',
      description: 'Added to favorites with pricing transparency',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'visited',
      title: 'Viewed Heritage on the Marina',
      description: 'Checked amenities and availability',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'shared',
      title: 'Shared Golden Gate Senior Living',
      description: 'Sent details to family members',
      timestamp: '2 days ago'
    },
    {
      id: '4',
      type: 'note',
      title: 'Added note to Sunrise Senior Living',
      description: 'Great dining options and medical care',
      timestamp: '3 days ago'
    }
  ]
};

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
    savedDate: "2024-01-03",
    priceRange: "$4,200 - $6,800",
    rating: 4.5,
    reviewCount: 127
  },
  {
    id: 275,
    name: "Heritage on the Marina",
    address: "3400 Laguna St",
    city: "San Francisco",
    state: "CA",
    careTypes: ["Independent Living", "Memory Care"],
    photos: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop"],
    availabilityStatus: "Limited Availability",
    savedDate: "2024-01-02",
    priceRange: "$5,800 - $8,200",
    rating: 4.8,
    reviewCount: 89
  },
  {
    id: 276,
    name: "Golden Gate Senior Living",
    address: "2800 California St",
    city: "San Francisco",
    state: "CA",
    careTypes: ["Assisted Living", "Memory Care"],
    photos: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"],
    availabilityStatus: "Waitlist Available",
    savedDate: "2024-01-01",
    priceRange: "$3,800 - $5,200",
    rating: 4.3,
    reviewCount: 156
  }
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if not authenticated
  if (!isAuthenticated) {
    return null; // Redirect will handle this
  }

  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'saved': return <HeartIcon className="h-4 w-4 text-red-500" />;
      case 'visited': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'shared': return <Share2 className="h-4 w-4 text-green-500" />;
      case 'note': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-1">
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 font-medium">Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {userInitials}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.firstName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Premium Member
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO WELCOME SECTION */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {user?.firstName || 'User'}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">
                    Your personalized senior living journey continues
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{mockStats.totalSaved}</div>
                        <div className="text-sm text-blue-100">Saved</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{mockStats.totalVisited}</div>
                        <div className="text-sm text-blue-100">Visited</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{mockStats.tourScheduled}</div>
                        <div className="text-sm text-blue-100">Tours</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{mockStats.weeklyActivity}</div>
                    <div className="text-sm text-blue-100">Weekly Activity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Search Communities</h3>
                  <p className="text-sm text-gray-600">Find new options</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Schedule Tour</h3>
                  <p className="text-sm text-gray-600">Book a visit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Share with Family</h3>
                  <p className="text-sm text-gray-600">Collaborate easily</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <HelpCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get Help</h3>
                  <p className="text-sm text-gray-600">Expert guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CONTENT TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Tours</span>
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

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RECENT ACTIVITY */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* INSIGHTS & STATS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Your Journey Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Communities Explored</span>
                      <span className="text-sm font-medium">{mockStats.totalVisited + mockStats.totalSaved}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notes & Comparisons</span>
                      <span className="text-sm font-medium">{mockStats.totalNotes}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Family Collaboration</span>
                      <span className="text-sm font-medium">{mockStats.totalShared}</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Next Steps</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      You're making great progress! Consider scheduling tours for your top 3 favorites.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAVORITES TAB */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Favorite Communities</h2>
                <p className="text-gray-600">Communities you've saved for further consideration</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFavoriteCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={community.photos[0]} 
                      alt={community.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      </div>
                    </div>
                    <Badge className="absolute bottom-3 left-3 bg-green-500">
                      {community.availabilityStatus}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{community.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{community.address}</p>
                    <p className="text-sm text-gray-600 mb-3">{community.city}, {community.state}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{community.rating}</span>
                        <span className="text-xs text-gray-500">({community.reviewCount})</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {community.priceRange}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.careTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Tour
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TOURS TAB */}
          <TabsContent value="tours" className="space-y-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tours Scheduled</h3>
              <p className="text-gray-600 mb-6">Ready to visit some communities? Schedule your first tour!</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule a Tour
              </Button>
            </div>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Notes</h3>
              <p className="text-gray-600 mb-6">Keep track of your thoughts and comparisons</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add a Note
              </Button>
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Privacy Settings</span>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Search Preferences</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Help Center</span>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contact Support</span>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Schedule Call</span>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}