import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Users, 
  Activity, 
  UtensilsCrossed, 
  Heart, 
  Home, 
  Phone, 
  Mail,
  Star,
  MessageCircle,
  Shield,
  Wifi,
  BookOpen,
  Music,
  TreePine,
  Bus,
  Clock,
  Info,
  Check,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function PublicResidentPortal() {
  const [communityCode, setCommunityCode] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const { toast } = useToast();

  // Fetch community info when code is entered
  const handleAccessPortal = () => {
    if (!communityCode) {
      toast({
        title: "Please enter a community code",
        description: "Ask your community staff for the access code",
        variant: "destructive"
      });
      return;
    }

    // Mock community data for demo - in production this would validate the code
    setSelectedCommunity({
      id: 1,
      name: 'Sunrise Senior Living - Beverly Hills',
      code: communityCode,
      todaysMenu: {
        breakfast: ['Scrambled eggs', 'Fresh fruit', 'Whole wheat toast', 'Orange juice'],
        lunch: ['Grilled chicken salad', 'Tomato soup', 'Fresh rolls', 'Apple pie'],
        dinner: ['Roasted salmon', 'Rice pilaf', 'Steamed vegetables', 'Chocolate mousse']
      },
      activities: [
        { time: '9:00 AM', name: 'Morning Yoga', location: 'Wellness Center', icon: Activity },
        { time: '10:30 AM', name: 'Book Club', location: 'Library', icon: BookOpen },
        { time: '2:00 PM', name: 'Live Piano Performance', location: 'Main Lounge', icon: Music },
        { time: '3:30 PM', name: 'Garden Walk', location: 'Rose Garden', icon: TreePine },
        { time: '7:00 PM', name: 'Movie Night: Casablanca', location: 'Theater Room', icon: Star }
      ],
      transportation: [
        { time: '10:00 AM', destination: 'Grocery Shopping - Whole Foods', spots: 5 },
        { time: '1:00 PM', destination: 'Medical Appointments', spots: 3 },
        { time: '3:00 PM', destination: 'Shopping Mall Trip', spots: 8 }
      ],
      wellness: {
        medicationReminders: ['8:00 AM - Morning medications', '2:00 PM - Afternoon medications', '8:00 PM - Evening medications'],
        exerciseClasses: ['Chair Yoga - Daily 9 AM', 'Water Aerobics - MWF 10 AM', 'Walking Club - Daily 4 PM'],
        healthTips: 'Stay hydrated! Aim for 8 glasses of water daily.'
      },
      communications: [
        { date: 'Today', message: 'Welcome new resident Mr. Johnson to our community!', type: 'announcement' },
        { date: 'Yesterday', message: 'Flu shots available tomorrow in the wellness center', type: 'health' },
        { date: '2 days ago', message: 'Family BBQ this Saturday - RSVP by Thursday', type: 'event' }
      ]
    });
  };

  if (!selectedCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-md mx-auto mt-20">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Resident & Family Portal
              </CardTitle>
              <CardDescription className="text-center">
                Access your community's daily activities, menus, and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Community Access Code</Label>
                <Input
                  id="code"
                  placeholder="Enter your 6-digit code"
                  value={communityCode}
                  onChange={(e) => setCommunityCode(e.target.value)}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Don't have a code? Ask your community staff or family member
                </p>
              </div>
              
              <Button 
                onClick={handleAccessPortal}
                className="w-full"
                size="lg"
              >
                <Shield className="mr-2 h-4 w-4" />
                Access Portal
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground mb-3">
                  Popular Communities
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setCommunityCode('DEMO01');
                      handleAccessPortal();
                    }}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Try Demo Community
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {selectedCommunity.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome to your community portal
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedCommunity(null)}
            >
              Switch Community
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="dining">Dining</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="communications">Updates</TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {selectedCommunity.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <activity.icon className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium">{activity.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.time} • {activity.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Today's Menu */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UtensilsCrossed className="mr-2 h-5 w-5" />
                    Today's Menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Breakfast (7-9 AM)</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {selectedCommunity.todaysMenu.breakfast.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <Check className="h-3 w-3 mr-2 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Lunch (12-2 PM)</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {selectedCommunity.todaysMenu.lunch.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <Check className="h-3 w-3 mr-2 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Dinner (5-7 PM)</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {selectedCommunity.todaysMenu.dinner.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <Check className="h-3 w-3 mr-2 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transportation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bus className="mr-2 h-5 w-5" />
                    Transportation Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedCommunity.transportation.map((trip: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{trip.destination}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{trip.time}</p>
                          </div>
                          <Badge variant={trip.spots > 0 ? "default" : "secondary"}>
                            {trip.spots} spots
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Reserve a Spot
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message Staff
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Heart className="mr-2 h-4 w-4" />
                      Request Care
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <UtensilsCrossed className="mr-2 h-4 w-4" />
                      Meal Request
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Guest Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{day}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span>9:00 AM - Morning Exercise</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span>10:30 AM - Book Club</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-purple-600" />
                          <span>2:00 PM - Music Hour</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dining Tab */}
          <TabsContent value="dining">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Dining Menu</CardTitle>
                <CardDescription>
                  Special dietary needs? Contact dining services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="monday">
                  <TabsList>
                    <TabsTrigger value="monday">Mon</TabsTrigger>
                    <TabsTrigger value="tuesday">Tue</TabsTrigger>
                    <TabsTrigger value="wednesday">Wed</TabsTrigger>
                    <TabsTrigger value="thursday">Thu</TabsTrigger>
                    <TabsTrigger value="friday">Fri</TabsTrigger>
                    <TabsTrigger value="saturday">Sat</TabsTrigger>
                    <TabsTrigger value="sunday">Sun</TabsTrigger>
                  </TabsList>
                  <TabsContent value="monday" className="mt-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2">Breakfast</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Pancakes, fresh berries, maple syrup, orange juice
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2">Lunch</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Chicken Caesar salad, minestrone soup, garlic bread
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2">Dinner</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Beef tenderloin, mashed potatoes, green beans, tiramisu
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-red-500" />
                    Health & Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Medication Reminders</h4>
                    <div className="space-y-2">
                      {selectedCommunity.wellness.medicationReminders.map((reminder: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{reminder}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Exercise Classes</h4>
                    <div className="space-y-2">
                      {selectedCommunity.wellness.exerciseClasses.map((cls: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Activity className="h-4 w-4 text-green-600" />
                          <span>{cls}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wellness Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="mr-2 h-4 w-4" />
                      Schedule Doctor Appointment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="mr-2 h-4 w-4" />
                      Request Nurse Visit
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="mr-2 h-4 w-4" />
                      Physical Therapy Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Emergency Contacts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>Community Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {selectedCommunity.communications.map((comm: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={comm.type === 'health' ? 'destructive' : comm.type === 'event' ? 'default' : 'secondary'}>
                            {comm.type}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{comm.date}</span>
                        </div>
                        <p className="text-sm">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}