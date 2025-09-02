import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home,
  DollarSign,
  Calendar,
  UtensilsCrossed,
  Bus,
  Wrench,
  Heart,
  Users,
  FileText,
  MessageSquare,
  Shield,
  Video,
  Briefcase,
  Activity,
  Clock,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Phone,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Sparkles,
  MapPin,
  CreditCard,
  Receipt,
  Utensils,
  Car,
  HeartHandshake,
  Camera,
  Music,
  BookOpen,
  Gamepad2,
  Dumbbell,
  Coffee,
  Flower,
  Gift,
  Mail,
  HelpCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';

export default function ResidentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAuthenticated } = useAuth();

  // Fetch resident data
  const { data: residentData, isLoading } = useQuery({
    queryKey: ['/api/resident/dashboard'],
    queryFn: async () => {
      // Mock data for demo - would connect to real API
      return {
        resident: {
          name: 'Mary Johnson',
          room: 'Apartment 204B',
          community: 'Sunrise Senior Living - Arlington',
          moveInDate: '2023-06-15',
          careLevel: 'Assisted Living',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary'
        },
        financial: {
          currentBalance: 5250.00,
          dueDate: '2025-09-01',
          lastPayment: { amount: 5250.00, date: '2025-08-01' },
          monthlyRate: 5250.00,
          autoPayEnabled: true
        },
        activities: {
          todaySchedule: [
            { time: '8:00 AM', activity: 'Breakfast', location: 'Main Dining Room' },
            { time: '9:30 AM', activity: 'Chair Yoga', location: 'Activity Room' },
            { time: '12:00 PM', activity: 'Lunch', location: 'Main Dining Room' },
            { time: '2:00 PM', activity: 'Book Club', location: 'Library' },
            { time: '4:00 PM', activity: 'Live Music - Jazz Trio', location: 'Lounge' },
            { time: '6:00 PM', activity: 'Dinner', location: 'Main Dining Room' }
          ],
          upcomingEvents: [
            { date: '2025-09-02', event: 'Birthday Celebration', time: '3:00 PM' },
            { date: '2025-09-05', event: 'Shopping Trip to Mall', time: '10:00 AM' },
            { date: '2025-09-08', event: 'Movie Night: Classic Films', time: '7:00 PM' }
          ]
        },
        dining: {
          todayMenu: {
            breakfast: ['Scrambled Eggs', 'Bacon', 'Toast', 'Fresh Fruit'],
            lunch: ['Grilled Chicken Salad', 'Tomato Soup', 'Dinner Roll'],
            dinner: ['Pot Roast', 'Mashed Potatoes', 'Green Beans', 'Apple Pie']
          },
          dietaryRestrictions: ['Low Sodium', 'Diabetic Friendly'],
          mealCredits: 90
        },
        health: {
          lastCheckIn: '2025-08-28',
          nextAppointment: { date: '2025-09-10', type: 'Doctor Visit', time: '10:30 AM' },
          medications: 5,
          emergencyContact: 'John Johnson (Son) - (555) 123-4567'
        },
        maintenance: {
          openRequests: 1,
          completedThisMonth: 3,
          lastRequest: { date: '2025-08-28', issue: 'Leaky faucet', status: 'In Progress' }
        },
        transportation: {
          upcomingRides: [
            { date: '2025-09-05', destination: 'Shopping Mall', time: '10:00 AM' },
            { date: '2025-09-10', destination: 'Medical Center', time: '10:00 AM' }
          ],
          regularSchedule: ['Tuesday: Grocery Store', 'Thursday: Shopping Mall', 'Sunday: Church Services']
        },
        communications: {
          unreadMessages: 3,
          announcements: 2,
          familyUpdates: 1
        }
      };
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Home className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: DollarSign, label: 'Pay Bill', href: '/resident-billing-portal', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { icon: UtensilsCrossed, label: 'View Menu', href: '/dining-menu-viewer', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { icon: Bus, label: 'Book Ride', href: '/transportation-scheduler', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { icon: Wrench, label: 'Maintenance', href: '/maintenance-request-portal', color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' },
    { icon: Calendar, label: 'Activities', href: '/public-resident-portal', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { icon: Video, label: 'Video Call', href: '#', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome back, {residentData?.resident.name}!
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {residentData?.resident.room} • {residentData?.resident.community}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {(residentData?.communications?.unreadMessages ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {residentData?.communications.unreadMessages}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Contact Alert */}
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <Phone className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Emergency Contact:</strong> {residentData?.health.emergencyContact} • 
            <span className="ml-2 font-bold">Community Emergency: (555) 911-HELP</span>
          </AlertDescription>
        </Alert>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} href={action.href}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                    <CardContent className="p-4 text-center">
                      <div className={`p-3 rounded-lg ${action.color} mx-auto w-fit mb-2`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">{action.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="dining">Dining</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {residentData?.activities.todaySchedule.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{item.activity}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{item.location}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="w-full mt-3">
                    View Full Schedule
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${residentData?.financial.currentBalance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                      <p className="font-medium">{residentData?.financial.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Auto-pay enabled</span>
                    </div>
                    <Link href="/resident-billing-portal">
                      <Button className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Billing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Health & Wellness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health & Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium mb-1">Next Appointment</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {residentData?.health.nextAppointment.type}
                      </p>
                      <p className="text-xs font-semibold text-blue-600">
                        {residentData?.health.nextAppointment.date} at {residentData?.health.nextAppointment.time}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medications</span>
                      <Badge>{residentData?.health.medications} Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Check-in</span>
                      <span className="text-sm font-medium">{residentData?.health.lastCheckIn}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <HeartHandshake className="mr-2 h-4 w-4" />
                      Wellness Check-in
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Meal Credits</p>
                      <p className="text-xl font-bold">{residentData?.dining.mealCredits}</p>
                    </div>
                    <Utensils className="h-8 w-8 text-orange-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Rides</p>
                      <p className="text-xl font-bold">{residentData?.transportation.upcomingRides.length}</p>
                    </div>
                    <Car className="h-8 w-8 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                      <p className="text-xl font-bold">{residentData?.maintenance.openRequests}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-gray-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                      <p className="text-xl font-bold">{residentData?.communications.unreadMessages}</p>
                    </div>
                    <Mail className="h-8 w-8 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Community Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <p className="font-medium text-sm">Fall Festival Coming Up!</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Join us on September 15th for our annual Fall Festival with live music, food, and fun activities for all residents and families.
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                    <p className="font-medium text-sm">New Fitness Classes</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Starting next week: Water Aerobics on Mondays and Tai Chi on Wednesdays. Sign up at the front desk!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Activities & Events</CardTitle>
                <CardDescription>Your schedule and upcoming events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Today's Full Schedule</h3>
                    <div className="space-y-2">
                      {residentData?.activities.todaySchedule.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <p className="font-medium">{item.activity}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.location}</p>
                          </div>
                          <span className="text-sm font-semibold">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Upcoming Events</h3>
                    <div className="space-y-3">
                      {residentData?.activities.upcomingEvents.map((event, idx) => (
                        <div key={idx} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <p className="font-medium">{event.event}</p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {event.date} at {event.time}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Activity Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Music className="mr-2 h-4 w-4" />
                          Music & Arts
                        </Button>
                        <Button variant="outline" size="sm">
                          <Dumbbell className="mr-2 h-4 w-4" />
                          Fitness
                        </Button>
                        <Button variant="outline" size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Education
                        </Button>
                        <Button variant="outline" size="sm">
                          <Gamepad2 className="mr-2 h-4 w-4" />
                          Games
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dining Tab */}
          <TabsContent value="dining">
            <Card>
              <CardHeader>
                <CardTitle>Dining Services</CardTitle>
                <CardDescription>Menus, meal credits, and dietary preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Breakfast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {residentData?.dining.todayMenu.breakfast.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Lunch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {residentData?.dining.todayMenu.lunch.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-orange-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Dinner</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {residentData?.dining.todayMenu.dinner.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-purple-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">Meal Credits Remaining</p>
                    <p className="text-2xl font-bold">{residentData?.dining.mealCredits}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dietary Preferences</p>
                    <div className="flex gap-2 mt-1">
                      {residentData?.dining.dietaryRestrictions.map((diet, idx) => (
                        <Badge key={idx} variant="secondary">{diet}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link href="/dining-menu-viewer" className="flex-1">
                    <Button className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Weekly Menu
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex-1">
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    Request Special Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transportation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Transportation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-sm">Upcoming Rides</h4>
                    {residentData?.transportation.upcomingRides.map((ride, idx) => (
                      <div key={idx} className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <p className="font-medium text-sm">{ride.destination}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {ride.date} at {ride.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link href="/transportation-scheduler">
                    <Button className="w-full">Book Transportation</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Open Requests</span>
                      <Badge variant={(residentData?.maintenance?.openRequests ?? 0) > 0 ? 'default' : 'secondary'}>
                        {residentData?.maintenance.openRequests}
                      </Badge>
                    </div>
                    {residentData?.maintenance.lastRequest && (
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <p className="font-medium text-sm">{residentData.maintenance.lastRequest.issue}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {residentData.maintenance.lastRequest.status} • {residentData.maintenance.lastRequest.date}
                        </p>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Completed this month: {residentData?.maintenance.completedThisMonth}
                    </div>
                  </div>
                  <Link href="/maintenance-request-portal">
                    <Button className="w-full">Submit Request</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Billing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Billing & Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Rate</span>
                      <span className="font-medium">${residentData?.financial.monthlyRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Balance</span>
                      <span className="font-bold text-lg">${residentData?.financial.currentBalance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Due Date</span>
                      <span className="font-medium">{residentData?.financial.dueDate}</span>
                    </div>
                  </div>
                  <Link href="/resident-billing-portal">
                    <Button className="w-full">Manage Billing</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Family Communication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unread Messages</span>
                      <Badge>{residentData?.communications.unreadMessages}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Family Updates</span>
                      <Badge variant="secondary">{residentData?.communications.familyUpdates}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Video className="mr-2 h-4 w-4" />
                      Video Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Life</CardTitle>
                <CardDescription>Connect with neighbors and participate in community activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Community Groups</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Book Club
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Flower className="mr-2 h-4 w-4" />
                        Garden Club
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Coffee className="mr-2 h-4 w-4" />
                        Coffee & Conversation
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Camera className="mr-2 h-4 w-4" />
                        Photography Club
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Volunteer Opportunities</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="font-medium text-sm">Welcome Committee</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Help new residents feel at home
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-medium text-sm">Activity Assistant</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Help organize and run activities
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="font-medium text-sm">Library Helper</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Organize books and help others
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Community Resources</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="mr-2 h-4 w-4" />
                        Community Map
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Gift className="mr-2 h-4 w-4" />
                        Gift Shop
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Info className="mr-2 h-4 w-4" />
                        Community Info
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}