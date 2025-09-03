import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/footer';
import { NavigationHeader } from '@/components/NavigationHeader';
import { FamilyVideoCall } from '@/components/integrations/FamilyVideoCall';
import { FamilyHealthRecords } from '@/components/integrations/FamilyHealthRecords';
import { FamilyMedicareManager } from '@/components/family/FamilyMedicareManager';
import DualSidedCostCalculator from '@/components/billing/DualSidedCostCalculator';
import CareCoordinationManager from '@/components/care/CareCoordinationManager';
import DailyLifeManager from '@/components/daily/DailyLifeManager';
import StaffManagementSystem from '@/components/staff/StaffManagementSystem';
import MarketingOccupancyManager from '@/components/marketing/MarketingOccupancyManager';
import MultiPropertyDashboard from '@/components/enterprise/MultiPropertyDashboard';
import ApiIntegrationHub from '@/components/enterprise/ApiIntegrationHub';
import { 
  Calendar, 
  MessageCircle, 
  Heart,
  Activity, 
  MapPin, 
  Clock, 
  Star, 
  DollarSign,
  Users,
  Send,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CalendarCheck,
  FileText,
  BarChart3,
  Share2,
  Download,
  Filter,
  Search,
  CheckCircle,
  Target,
  Shield,
  TrendingUp,
  Lightbulb,
  UserPlus,
  Video,
  Receipt,
  Calculator
} from 'lucide-react';

export default function FamilyCollaborationCenter() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newMessage, setNewMessage] = useState('');

  // Fetch family messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/family/messages'],
    refetchInterval: 5000, // Poll for updates every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/family/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/messages'] });
      setNewMessage('');
    },
  });

  // Fetch upcoming tours from the API
  const { data: upcomingTours = [], isLoading: toursLoading } = useQuery({
    queryKey: ['/api/tours'],
  });

  // Fetch visit history from the API
  const { data: visitHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/family/visit-history'],
  });

  // Format messages from API data
  const familyMessages = messagesData?.messages?.map((msg: any) => ({
    id: msg.id,
    sender: msg.senderName || 'Unknown',
    avatar: msg.senderName?.substring(0, 2).toUpperCase() || 'UN',
    message: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleString(),
    isCurrentUser: msg.senderId === messagesData?.currentUserId
  })) || [];

  // Fetch shared favorites from the API
  const { data: sharedFavorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/family/shared-favorites'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Bar */}
      <NavigationHeader />
      
      {/* Page Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Family Collaboration Center
                </h1>
                <p className="text-sm text-muted-foreground">Unite your family in finding the perfect senior care</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <Users className="w-3 h-3 mr-1" />
              FREE FOR FAMILIES ALWAYS
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Demo Mode Notice - Only show when not signed in */}
        <Card className="mb-6 border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Preview Mode - Example Data Shown
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Sign in to access your family's real collaboration tools and saved information.
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setLocation('/login')}
              >
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Value Proposition Hero */}
        <Card className="mb-8 border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold">
                Why Use Family Collaboration?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Finding senior care is a family decision. Our collaboration tools help you work together, 
                share research, compare options, and make confident decisions as a united family.
              </p>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold">Tour Tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Document visits with photos, ratings & detailed notes
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">TourMate™</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule tours & sync calendars across family
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Private Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Discuss options privately with family members
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="font-semibold">Shared Lists</h3>
                <p className="text-sm text-muted-foreground">
                  Save favorites & compare communities side-by-side
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-center font-semibold mb-4">How It Works</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-sm">Invite Family</span>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-sm">Research Together</span>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-sm">Visit & Document</span>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <span className="text-sm">Decide Together</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-[64px] z-30 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-xl pb-6 pt-4 border-b-2 border-primary/10">
            <div className="w-full overflow-x-auto px-2">
              <TabsList className="inline-flex h-auto min-w-full lg:w-full p-2 bg-gradient-to-r from-slate-100/90 to-gray-100/90 dark:from-slate-900/90 dark:to-gray-900/90 rounded-xl shadow-lg border border-primary/10">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-hover:from-amber-500/10 group-hover:to-yellow-500/10 data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 mr-2 flex-shrink-0 text-amber-600 dark:text-amber-400 group-data-[state=active]:text-amber-700 dark:group-data-[state=active]:text-amber-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Overview</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="tour-tracker" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <FileText className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Tour Tracker</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="tourmate" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">TourMate™</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0 text-green-600 dark:text-green-400 group-data-[state=active]:text-green-700 dark:group-data-[state=active]:text-green-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Messages</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="video-calls" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Video className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Video Calls</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="health-records" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Health Records</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="medicare" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400 group-data-[state=active]:text-indigo-700 dark:group-data-[state=active]:text-indigo-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Medicare</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="care" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 data-[state=active]:from-red-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2 flex-shrink-0 text-red-600 dark:text-red-400 group-data-[state=active]:text-red-700 dark:group-data-[state=active]:text-red-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Care</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="daily" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Activity className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Daily Life</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="staff" 
                  className="flex-1 min-w-[120px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Users className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Staff</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="availability" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Home className="w-5 h-5 mr-2 flex-shrink-0 text-amber-600 dark:text-amber-400 group-data-[state=active]:text-amber-700 dark:group-data-[state=active]:text-amber-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Availability</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="corporate" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Briefcase className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Corporate</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Zap className="w-5 h-5 mr-2 flex-shrink-0 text-orange-600 dark:text-orange-400 group-data-[state=active]:text-orange-700 dark:group-data-[state=active]:text-orange-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Integrations</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Receipt className="w-5 h-5 mr-2 flex-shrink-0 text-green-600 dark:text-green-400 group-data-[state=active]:text-green-700 dark:group-data-[state=active]:text-green-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Billing</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="calculator" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Calculator className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Cost Calculator</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-rose-500/0 group-hover:from-red-500/10 group-hover:to-rose-500/10 data-[state=active]:from-red-500/20 data-[state=active]:to-rose-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2 flex-shrink-0 text-red-600 dark:text-red-400 group-data-[state=active]:text-red-700 dark:group-data-[state=active]:text-red-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Favorites</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Your Family's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Communities Viewed</span>
                    <Badge>12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tours Scheduled</span>
                    <Badge>2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tours Completed</span>
                    <Badge>2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Family Members</span>
                    <Badge>3</Badge>
                  </div>
                  <Separator className="my-4" />
                  <Button className="w-full" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Family Member
                  </Button>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Schedule Your First Tour</p>
                      <p className="text-xs text-muted-foreground">
                        Book visits to your top 3 communities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Complete Tour Reports</p>
                      <p className="text-xs text-muted-foreground">
                        Document each visit while details are fresh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Compare Final Options</p>
                      <p className="text-xs text-muted-foreground">
                        Use our comparison tool to evaluate top choices
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Make Decision Together</p>
                      <p className="text-xs text-muted-foreground">
                        Vote and discuss as a family
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Recent Family Activity
                  <Badge variant="outline" className="ml-2">Example Data</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah</span> completed a tour report for Peaceful Gardens
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Michael</span> added Harmony House to favorites
                      </p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah</span> scheduled a tour at Golden Years
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tour Tracker Tab */}
          <TabsContent value="tour-tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Tour Visit Reports
                    </CardTitle>
                    <CardDescription>
                      Document your community visits with detailed reports your whole family can review
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Example Data</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {visitHistory.map((visit) => (
                  <Card key={visit.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{visit.community}</h3>
                            <Badge variant="outline">{visit.date}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= visit.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              by {visit.familyMember}
                            </span>
                          </div>
                          <p className="text-sm">{visit.notes}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-green-600">Pros:</p>
                              <ul className="text-sm space-y-1 mt-1">
                                {visit.pros.map((pro, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <span className="text-green-500">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-600">Cons:</p>
                              <ul className="text-sm space-y-1 mt-1">
                                {visit.cons.map((con, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <span className="text-red-500">✗</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {visit.wouldRecommend && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Would Recommend
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Visit Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TourMate Tab */}
          <TabsContent value="tourmate" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      TourMate™ Scheduler
                    </CardTitle>
                    <CardDescription>
                      Coordinate tour schedules with your family and never miss an appointment
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Example Data</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    Upcoming Tours
                  </h3>
                  {upcomingTours.map((tour) => (
                    <Card key={tour.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{tour.community}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {tour.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {tour.time}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {tour.address}
                            </p>
                            <p className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              Contact: {tour.contact} - {tour.phone}
                            </p>
                            {tour.notes && (
                              <p className="italic text-muted-foreground">
                                Note: {tour.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              Add to Calendar
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Schedule New Tour</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Community Name</Label>
                      <Input placeholder="Enter community name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input placeholder="Contact name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Questions to ask, things to look for..." />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                      Family Messages
                    </CardTitle>
                    <CardDescription>
                      Your unified family thread - all care journey conversations in one place
                    </CardDescription>
                  </div>
                  {messagesLoading && <Badge variant="outline">Loading...</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 mb-4">
                    {messagesLoading ? (
                      <div className="text-center text-muted-foreground py-8">
                        Loading messages...
                      </div>
                    ) : messagesData?.messages?.length > 0 ? (
                      messagesData.messages.map((msg: any) => {
                        const isCurrentUser = msg.senderId === messagesData.currentUserId;
                        const isSystemMessage = msg.messageType === 'system';
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${isCurrentUser && !isSystemMessage ? 'justify-end' : ''}`}
                          >
                            {!isCurrentUser && !isSystemMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {msg.senderName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[70%] ${
                                isCurrentUser && !isSystemMessage ? 'order-first' : ''
                              }`}
                            >
                              {isSystemMessage ? (
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-300 dark:border-yellow-700">
                                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                    🎉 {msg.content}
                                  </p>
                                  {msg.metadata && (
                                    <div className="mt-2 text-xs text-yellow-800 dark:text-yellow-200">
                                      {msg.metadata.communityName && (
                                        <span>Community: {msg.metadata.communityName}</span>
                                      )}
                                      {msg.metadata.notes && (
                                        <p className="mt-1 italic">{msg.metadata.notes}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div
                                    className={`rounded-lg p-3 ${
                                      isCurrentUser
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {msg.senderName || 'Unknown'} • {new Date(msg.createdAt).toLocaleString()}
                                  </p>
                                </>
                              )}
                            </div>
                            {isCurrentUser && !isSystemMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>ME</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No messages yet. Start your family conversation!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendMessageMutation.isPending}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                        e.preventDefault();
                        sendMessageMutation.mutate(newMessage.trim());
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendMessageMutation.mutate(newMessage.trim());
                      }
                    }}
                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Calls Tab */}
          <TabsContent value="video-calls" className="space-y-6">
            <FamilyVideoCall 
              familyId="demo"
              userId="demo"
            />
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="health-records" className="space-y-6">
            <FamilyHealthRecords 
              residentId="demo"
              communityId="demo"
              tierLevel="premium"
            />
          </TabsContent>

          {/* Medicare Tab */}
          <TabsContent value="medicare" className="space-y-6">
            <FamilyMedicareManager 
              userId="demo-user"
              residentName="Demo Resident"
            />
          </TabsContent>

          {/* Shared Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      Shared Favorites
                    </CardTitle>
                    <CardDescription>
                      Communities your family is considering - compare and discuss together
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Example Data</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {sharedFavorites.map((fav) => (
                    <Card key={fav.id} className="border-l-4 border-l-rose-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{fav.name}</h4>
                              <Badge variant="outline">
                                <DollarSign className="w-3 h-3" />
                                {fav.price}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {fav.location}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm">{fav.rating} Platform</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-purple-400 fill-current" />
                                <span className="text-sm">{fav.familyRating} Family</span>
                              </div>
                            </div>
                            <p className="text-sm italic">{fav.notes}</p>
                            <p className="text-xs text-muted-foreground">Added by {fav.addedBy}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Community to Favorites
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Coordination Tab - Family View */}
          <TabsContent value="care" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Care Coordination
                    </CardTitle>
                    <CardDescription>
                      Complete access to health records, medications, appointments, and care plans
                    </CardDescription>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Real-Time Updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CareCoordinationManager 
                  residentId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Life Tab - Family View */}
          <TabsContent value="daily" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Daily Life Connection
                    </CardTitle>
                    <CardDescription>
                      Stay connected with daily activities, meals, photos, and wellness updates
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Live Updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DailyLifeManager 
                  residentId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Directory Tab - Family View */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Care Team Directory
                    </CardTitle>
                    <CardDescription>
                      Meet the dedicated professionals caring for your loved one
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    Transparent Care
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <StaffManagementSystem 
                  communityId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab - Family View of Available Units */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-amber-500" />
                      Available Rooms & Tours
                    </CardTitle>
                    <CardDescription>
                      Explore available accommodations and schedule a tour
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">
                    Live Availability
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <MarketingOccupancyManager 
                  communityId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab - Family View of Financial Transparency */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-green-500" />
                      Billing & Payments
                    </CardTitle>
                    <CardDescription>
                      View statements, make payments, and track financial information
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Full Transparency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Balance Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Current Balance</h3>
                    <Badge variant="outline" className="bg-white dark:bg-gray-900">Due April 1</Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    $5,785.00
                  </div>
                  <p className="text-sm text-muted-foreground">Includes base rent and care services</p>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {[
                      { date: 'Mar 1, 2025', description: 'Monthly Rent', amount: '$3,500.00', type: 'charge' },
                      { date: 'Mar 1, 2025', description: 'Level 2 Care Services', amount: '$1,285.00', type: 'charge' },
                      { date: 'Mar 5, 2025', description: 'Medication Management', amount: '$350.00', type: 'charge' },
                      { date: 'Mar 15, 2025', description: 'Transportation Services', amount: '$150.00', type: 'charge' },
                      { date: 'Feb 28, 2025', description: 'Payment Received - Thank you!', amount: '-$5,785.00', type: 'payment' }
                    ].map((transaction, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.type === 'payment' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {transaction.type === 'payment' ? 
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /> :
                              <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${transaction.type === 'payment' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Options */}
                <div className="flex gap-3">
                  <Button className="flex-1" variant="default">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Up AutoPay
                  </Button>
                </div>

                {/* Download Statement */}
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Monthly Statement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Calculator Tab - Family Cost Planning */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  Cost Calculator
                </CardTitle>
                <CardDescription>
                  Estimate monthly costs based on care needs and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DualSidedCostCalculator 
                  viewMode="family"
                  prefilledData={{
                    baseRent: 3500,
                    careLevel: 'assisted',
                    roomType: 'private'
                  }}
                />
              </CardContent>
            </Card>

            {/* Cost Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Comparison</CardTitle>
                <CardDescription>Compare costs across your favorite communities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sunrise of Beverly Hills', monthly: '$5,785', annual: '$69,420' },
                    { name: 'Atria Park of San Mateo', monthly: '$6,200', annual: '$74,400' },
                    { name: 'Brookdale Santa Monica', monthly: '$5,450', annual: '$65,400' }
                  ].map((community, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-500 transition-colors">
                      <div>
                        <h4 className="font-semibold">{community.name}</h4>
                        <p className="text-sm text-muted-foreground">Based on Level 2 care, private room</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{community.monthly}/mo</p>
                        <p className="text-sm text-muted-foreground">{community.annual}/year</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corporate Tab - View of Managing Organization */}
          <TabsContent value="corporate" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-500" />
                      Corporate Management
                    </CardTitle>
                    <CardDescription>
                      View the organization managing your loved one's community
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    Transparency View
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-purple-200 bg-purple-50">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <AlertDescription>
                    <strong>Why This Matters:</strong> Understanding the corporate structure behind your loved one's community helps you see the resources, support systems, and quality standards in place for their care.
                  </AlertDescription>
                </Alert>
                
                <MultiPropertyDashboard 
                  corporateId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab - View Connected Systems */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Connected Systems
                    </CardTitle>
                    <CardDescription>
                      See the technology powering your loved one's care
                    </CardDescription>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">
                    Transparency View
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-orange-200 bg-orange-50">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <strong>Why This Matters:</strong> Understanding the integrated systems helps you see how your loved one's community uses technology to enhance care quality, safety monitoring, and family communication.
                  </AlertDescription>
                </Alert>
                
                <ApiIntegrationHub 
                  corporateId="family-view"
                  viewMode="readonly"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}