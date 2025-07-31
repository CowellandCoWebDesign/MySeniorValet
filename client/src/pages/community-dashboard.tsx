import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageSquare, 
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Star,
  MapPin,
  Camera,
  Settings,
  FileText,
  DollarSign,
  Home,
  Search,
  Target,
  Award,
  Clock,
  ArrowRight,
  Download,
  Upload,
  Edit,
  Save,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Building
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";

export default function CommunityDashboard() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDateRange, setSelectedDateRange] = useState("30");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch community dashboard overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: [`/api/communities/${id}/dashboard/overview`],
    enabled: !!id && !!user,
  });

  // Fetch community messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/communities/${id}/dashboard/messages`],
    enabled: !!id && !!user,
  });

  // Fetch performance metrics
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: [`/api/communities/${id}/dashboard/performance`],
    enabled: !!id && !!user,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ reportType, dateRange, format }: any) => {
      const response = await apiRequest("POST", `/api/communities/${id}/dashboard/reports`, {
        reportType,
        dateRange,
        format
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    }
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`text-xs flex items-center mt-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(change)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MessageCard = ({ message }: any) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {message.senderName?.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{message.senderName}</h4>
              <p className="text-xs text-muted-foreground">{message.senderEmail}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
              {message.priority}
            </Badge>
            <Badge variant={message.status === 'unread' ? 'default' : 'outline'}>
              {message.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h5 className="font-medium text-sm mb-2">{message.subject}</h5>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{message.message}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Care: {message.careLevel}</span>
            <span>Timeline: {message.moveInTimeline}</span>
            {message.budget && (
              <span>Budget: ${message.budget.min?.toLocaleString()} - ${message.budget.max?.toLocaleString()}</span>
            )}
          </div>
          <span>{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
        </div>
        <div className="flex space-x-2 mt-3">
          <Button size="sm" className="h-7 text-xs">Reply</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">Schedule Tour</Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs">Archive</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Community Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your community profile, view analytics, and respond to inquiries
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => generateReportMutation.mutate({
                  reportType: 'analytics',
                  dateRange: selectedDateRange,
                  format: 'pdf'
                })}
                disabled={generateReportMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Hero Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.overview?.profileViews?.toLocaleString() || "0"}</div>
                <div className="text-blue-100 text-sm">Total Views</div>
                <div className="mt-2 flex items-center justify-center text-xs">
                  {overview?.trends?.viewsChange >= 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(overview?.trends?.viewsChange || 0)}% vs last period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.overview?.familyInquiries?.toLocaleString() || "0"}</div>
                <div className="text-blue-100 text-sm">Family Inquiries</div>
                <div className="mt-2 flex items-center justify-center text-xs">
                  {overview?.trends?.inquiriesChange >= 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(overview?.trends?.inquiriesChange || 0)}% vs last period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.overview?.tourRequests?.toLocaleString() || "0"}</div>
                <div className="text-blue-100 text-sm">Tour Requests</div>
                <div className="mt-2 flex items-center justify-center text-xs">
                  {overview?.trends?.toursChange >= 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(overview?.trends?.toursChange || 0)}% vs last period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.leadQuality?.conversionRate || "0"}%</div>
                <div className="text-blue-100 text-sm">Conversion Rate</div>
                <div className="mt-2 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                  Industry avg: 12%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-time Activity Feed */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                    Real-time Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profile views (last hour)</span>
                      <span className="font-semibold">42</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active visitors now</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tour requests today</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unread messages</span>
                      <span className="font-semibold text-orange-600">5</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Response time avg</span>
                      <span className="font-semibold text-blue-600">15 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Engagement Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">Key metrics across all channels</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Search Visibility</span>
                          <span className="text-sm font-semibold">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Profile Completeness</span>
                          <span className="text-sm font-semibold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Response Rate</span>
                          <span className="text-sm font-semibold">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Review Score</span>
                          <span className="text-sm font-semibold">4.7/5</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Photo Quality</span>
                          <span className="text-sm font-semibold">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Tour Conversion</span>
                          <span className="text-sm font-semibold">24%</span>
                        </div>
                        <Progress value={24} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compact Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Search Impressions</p>
                      <p className="text-xl font-bold text-green-600">
                        {overview?.overview?.searchImpressions?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <Search className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Phone Clicks</p>
                      <p className="text-xl font-bold text-blue-600">
                        {overview?.overview?.phoneCallClicks?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <Phone className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Review Score</p>
                      <p className="text-xl font-bold text-purple-600">
                        4.7<span className="text-sm font-normal">/5</span>
                      </p>
                    </div>
                    <Star className="h-6 w-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                      <p className="text-xl font-bold text-orange-600">
                        94<span className="text-sm font-normal">%</span>
                      </p>
                    </div>
                    <Home className="h-6 w-6 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Sources & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Top Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview?.topSources?.map((source: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.source}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(source.visitors / (overview?.topSources?.[0]?.visitors || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{source.visitors}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Lead Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-lg font-bold text-green-600">{overview?.leadQuality?.conversionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <span className="text-lg font-bold text-blue-600">{overview?.leadQuality?.avgResponseTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tour to Move-In</span>
                      <span className="text-lg font-bold text-purple-600">{overview?.leadQuality?.tourToMoveInRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Messages Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                    Recent Messages
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("messages")}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(0, 3).map((message: any) => (
                    <MessageCard key={message.id} message={message} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Family Messages & Inquiries</h2>
              <div className="flex space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                messages.map((message: any) => (
                  <MessageCard key={message.id} message={message} />
                ))
              )}
            </div>
          </TabsContent>

          {/* Profile Management Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    Community Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Community Name</label>
                    <Input placeholder="Your Community Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea placeholder="Tell families about your community..." className="min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Website</label>
                      <Input placeholder="www.yourcommunity.com" />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-green-600" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop photos here, or click to browse
                    </p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, WebP. Max 5MB per file.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Pricing & Availability</h2>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Real-Time Updates
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Pricing by Care Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Independent Living</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Assisted Living</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Memory Care</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Skilled Nursing</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                    Unit Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Available Units</label>
                      <Input placeholder="e.g., 5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Units</label>
                      <Input placeholder="e.g., 120" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Availability Status</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Waitlist">Waitlist</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2 text-purple-600" />
                    Search Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Search Position</span>
                      <Badge variant="outline">#{performance?.searchRanking?.currentPosition}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Position (30d)</span>
                      <Badge variant="outline">#{performance?.searchRanking?.averagePosition}</Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Keywords</span>
                      {performance?.searchRanking?.topKeywords?.map((keyword: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>"{keyword.keyword}"</span>
                          <div className="flex items-center space-x-2">
                            <span>Pos #{keyword.position}</span>
                            <span className="text-muted-foreground">{keyword.searches} searches</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-orange-600" />
                    Profile Completeness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Profile Score</span>
                        <span className="text-sm font-bold">{performance?.profileCompleteness?.score}%</span>
                      </div>
                      <Progress value={performance?.profileCompleteness?.score} className="h-2" />
                    </div>
                    <div>
                      <span className="text-sm font-medium mb-2 block">Missing Elements</span>
                      <div className="space-y-1">
                        {performance?.profileCompleteness?.missingElements?.map((element: string, index: number) => (
                          <div key={index} className="flex items-center text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mr-2 text-orange-500" />
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Advanced Analytics & Intelligence</h3>
              <AdvancedAnalytics timeRange="30d" showExport={true} autoRefresh={false} />
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  Dashboard Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Notifications</label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Auto-Response</label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="business-hours">Business hours only</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Auto-Response Message</label>
                  <Textarea 
                    placeholder="Thank you for your inquiry. We'll respond within 24 hours..."
                    className="min-h-[80px]"
                  />
                </div>
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}