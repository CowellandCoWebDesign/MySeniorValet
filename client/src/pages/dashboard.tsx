import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  SortAsc
} from "lucide-react";
import { Link } from "wouter";
import { CommunityCard } from "@/components/community-card";

// Mock data for demonstration - replace with real user data
const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  memberSince: "March 2024",
  profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
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

  const sortedFavorites = [...mockFavoriteCommunities].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'availability':
        return a.availabilityStatus.localeCompare(b.availabilityStatus);
      case 'recent':
      default:
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
    }
  });

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
                <img 
                  src={mockUser.profileImage} 
                  alt={mockUser.name}
                  className="h-8 w-8 rounded-full border-2 border-blue-200"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {mockUser.name}
                </span>
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
                <h1 className="text-3xl font-bold mb-2">Welcome back, {mockUser.name.split(' ')[0]}!</h1>
                <p className="text-blue-100">Your personalized senior living community dashboard</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockFavoriteCommunities.length}</div>
                    <div className="text-sm text-blue-100">Saved Communities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD TABS */}
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Visits</span>
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
                {sortedFavorites.map((community) => (
                  <div key={community.id} className="relative">
                    <CommunityCard community={community as any} />
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Alerts</h2>
              <p className="text-gray-600">Get notified when communities matching your criteria become available</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSearchAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{alert.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{alert.criteria}</p>
                      </div>
                      <Badge variant={alert.newMatches > 0 ? "default" : "secondary"}>
                        {alert.newMatches} new
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Last alert: {alert.lastAlert}</span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
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
          </TabsContent>

          {/* VISITS TAB */}
          <TabsContent value="visits" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scheduled Visits</h2>
              <p className="text-gray-600">Manage your community tours and appointments</p>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No visits scheduled</h3>
                <p className="text-gray-600 mb-6">Schedule tours with your favorite communities</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Notes</h2>
              <p className="text-gray-600">Keep track of your thoughts and impressions</p>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-600 mb-6">Add notes about communities you've visited or researched</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
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
                    <img 
                      src={mockUser.profileImage} 
                      alt={mockUser.name}
                      className="h-16 w-16 rounded-full border-4 border-blue-200"
                    />
                    <div>
                      <h3 className="font-semibold">{mockUser.name}</h3>
                      <p className="text-gray-600">{mockUser.email}</p>
                      <p className="text-sm text-gray-500">Member since {mockUser.memberSince}</p>
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