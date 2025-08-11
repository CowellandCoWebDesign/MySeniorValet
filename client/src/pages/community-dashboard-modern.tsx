import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Building, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Settings,
  Eye,
  Phone,
  Star,
  DollarSign,
  FileText,
  Camera,
  BarChart3,
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Send,
  Sparkles,
  Award,
  Target,
  Zap,
  Globe,
  Bell,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MessagesSection } from "@/components/MessagesSection";

export default function CommunityDashboardModern() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/communities/${id}/dashboard/overview`],
    enabled: !!id && isAuthenticated,
  });

  const { data: messages } = useQuery({
    queryKey: [`/api/communities/${id}/dashboard/messages`],
    enabled: !!id && isAuthenticated && activeTab === "messages",
  });

  const { data: performance } = useQuery({
    queryKey: [`/api/communities/${id}/dashboard/performance`],
    enabled: !!id && isAuthenticated && activeTab === "analytics",
  });

  // Update pricing mutation
  const updatePricingMutation = useMutation({
    mutationFn: async (pricingData: any) => {
      return apiRequest("POST", `/api/communities/${id}/update-pricing`, { pricingData });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pricing updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to access your community dashboard.
            </p>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: messages?.length || 0 },
    { id: "profile", label: "Profile", icon: Building },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Community Dashboard
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sunrise Senior Living</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/api/placeholder/32/32" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/admin/communities")}>
                        <Shield className="w-4 h-4 mr-2" />
                        Manage All Communities
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/admin-unified")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <div className="border-t my-1" />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setLocation("/community-portal")}>
                    <Home className="w-4 h-4 mr-2" />
                    Portal Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/support")}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/logout")}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Modern Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-64px)] sticky top-16 overflow-hidden`}>
          <div className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-600">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Upgrade Plan</span>
                </div>
                <p className="text-sm opacity-90 mb-3">
                  Get premium features and priority support
                </p>
                <Button size="sm" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        12.5%
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 dark:text-white">2,847</h3>
                    <p className="text-gray-600 dark:text-gray-400">Profile Views</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        8.3%
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 dark:text-white">47</h3>
                    <p className="text-gray-600 dark:text-gray-400">Family Inquiries</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        <ArrowDown className="w-3 h-3 mr-1" />
                        2.1%
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 dark:text-white">23</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tours Scheduled</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        <span className="text-xs">Stable</span>
                      </Badge>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 dark:text-white">4.8</h3>
                    <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
                  </CardContent>
                </Card>
              </div>

              {/* Traffic Sources & Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Traffic Sources</CardTitle>
                    <CardDescription className="dark:text-gray-400">Where your visitors come from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.topSources?.map((source: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <span className="font-medium dark:text-white">{source.source}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{source.visitors}</span>
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                style={{ width: `${source.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Recent Activity</CardTitle>
                    <CardDescription className="dark:text-gray-400">Latest updates and events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium dark:text-white">New inquiry from Sarah Johnson</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Assisted Living - 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium dark:text-white">Tour scheduled for Friday</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Memory Care - 5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium dark:text-white">Photos updated</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Gallery - 1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                  <CardDescription className="dark:text-gray-400">Manage your community profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300"
                    >
                      <Camera className="w-6 h-6 text-blue-600" />
                      <span className="text-sm">Update Photos</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300"
                    >
                      <DollarSign className="w-6 h-6 text-green-600" />
                      <span className="text-sm">Update Pricing</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300"
                    >
                      <Calendar className="w-6 h-6 text-purple-600" />
                      <span className="text-sm">Availability</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300"
                    >
                      <FileText className="w-6 h-6 text-orange-600" />
                      <span className="text-sm">Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "messages" && (
            <MessagesSection />
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Performance Analytics</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Search Performance</CardTitle>
                    <CardDescription>How you rank in search results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Position</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-blue-600">
                            #{performance?.searchRanking?.currentPosition || 0}
                          </span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            2 spots
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-600">Top Keywords</h4>
                        {performance?.searchRanking?.topKeywords?.map((keyword: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{keyword.keyword}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">#{keyword.position}</Badge>
                              <span className="text-xs text-gray-500">{keyword.searches} searches</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Profile Completeness</CardTitle>
                    <CardDescription>Optimize your community profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className="text-2xl font-bold text-green-600">
                          {performance?.profileCompleteness?.score || 0}%
                        </span>
                      </div>
                      <Progress value={performance?.profileCompleteness?.score || 0} className="h-3" />
                      
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Missing Elements</h4>
                        {performance?.profileCompleteness?.missingElements?.map((element: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm">{element}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Pricing & Availability</h2>
              
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Update Your Pricing</CardTitle>
                  <CardDescription>Keep your pricing current to attract more families</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Independent Living</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input type="number" placeholder="Min" className="w-full" />
                          <span>-</span>
                          <Input type="number" placeholder="Max" className="w-full" />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Assisted Living</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input type="number" placeholder="Min" className="w-full" />
                          <span>-</span>
                          <Input type="number" placeholder="Max" className="w-full" />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Memory Care</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input type="number" placeholder="Min" className="w-full" />
                          <span>-</span>
                          <Input type="number" placeholder="Max" className="w-full" />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Availability Status</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available Now</SelectItem>
                            <SelectItem value="limited">Limited Availability</SelectItem>
                            <SelectItem value="waitlist">Waitlist Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="transparency" />
                        <Label htmlFor="transparency">Enable pricing transparency badge</Label>
                      </div>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}