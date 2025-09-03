import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Coffee, 
  Camera, 
  Heart, 
  MessageSquare, 
  Activity,
  Users,
  Utensils,
  Music,
  Book,
  Palette,
  Award,
  Sun,
  Moon,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Smile,
  Phone,
  Video,
  Image,
  Send,
  Download,
  Share2,
  Bell,
  TrendingUp,
  User,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DailyLifeManagerProps {
  residentId: string;
  viewMode: 'community' | 'family';
  tier?: string;
}

export default function DailyLifeManager({ residentId, viewMode, tier }: DailyLifeManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('activities');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  // Fetch daily schedule
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['/api/daily/schedule', residentId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => apiRequest('GET', `/api/daily/schedule/${residentId}?date=${format(selectedDate, 'yyyy-MM-dd')}`)
  });

  // Fetch meal menu
  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['/api/daily/menu', residentId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => apiRequest('GET', `/api/daily/menu/${residentId}?date=${format(selectedDate, 'yyyy-MM-dd')}`)
  });

  // Fetch wellness data
  const { data: wellness, isLoading: wellnessLoading } = useQuery({
    queryKey: ['/api/daily/wellness', residentId],
    queryFn: () => apiRequest('GET', `/api/daily/wellness/${residentId}`)
  });

  // Fetch recent photos
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['/api/daily/photos', residentId],
    queryFn: () => apiRequest('GET', `/api/daily/photos/${residentId}`)
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/daily/messages', data),
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully"
      });
      setShowMessageDialog(false);
    }
  });

  const renderActivitySchedule = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Daily Activities
            </CardTitle>
            <CardDescription>
              Today's scheduled activities and events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}>
              Previous
            </Button>
            <Badge variant="secondary">
              {format(selectedDate, 'MMM dd, yyyy')}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}>
              Next
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {/* Morning Activities */}
          <div className="border-l-4 border-yellow-400 pl-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <Sun className="w-4 h-4" />
              Morning
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-brown-600" />
                  <div>
                    <p className="font-medium">Breakfast & Coffee Social</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">7:30 AM - Main Dining Room</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Attended</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Chair Yoga</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">9:00 AM - Activity Room</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Attended</Badge>
              </div>
            </div>
          </div>

          {/* Afternoon Activities */}
          <div className="border-l-4 border-orange-400 pl-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <Sun className="w-4 h-4" />
              Afternoon
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Art Class: Watercolor Painting</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2:00 PM - Art Studio</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-pink-600" />
                  <div>
                    <p className="font-medium">Live Piano Performance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">3:30 PM - Main Lounge</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
              </div>
            </div>
          </div>

          {/* Evening Activities */}
          <div className="border-l-4 border-indigo-400 pl-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <Moon className="w-4 h-4" />
              Evening
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Bingo Night</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">6:30 PM - Recreation Hall</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'community' && (
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
            <Button variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMealMenu = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-500" />
          Today's Menu
        </CardTitle>
        <CardDescription>
          Meal plans and dietary information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breakfast */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-brown-600" />
            <h3 className="font-semibold">Breakfast (7:00 AM - 9:00 AM)</h3>
          </div>
          <div className="ml-6 space-y-1">
            <p className="text-sm">• Scrambled eggs with whole wheat toast</p>
            <p className="text-sm">• Fresh fruit salad</p>
            <p className="text-sm">• Oatmeal with berries</p>
            <p className="text-sm">• Orange juice, coffee, or tea</p>
          </div>
          <div className="ml-6 flex gap-2">
            <Badge variant="outline" className="text-xs">Low Sodium</Badge>
            <Badge variant="outline" className="text-xs">Diabetic Friendly</Badge>
          </div>
        </div>

        <Separator />

        {/* Lunch */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-600" />
            <h3 className="font-semibold">Lunch (12:00 PM - 1:30 PM)</h3>
          </div>
          <div className="ml-6 space-y-1">
            <p className="text-sm">• Grilled chicken breast with herbs</p>
            <p className="text-sm">• Steamed vegetables</p>
            <p className="text-sm">• Garden salad</p>
            <p className="text-sm">• Rice pilaf</p>
            <p className="text-sm">• Fresh baked rolls</p>
          </div>
          <div className="ml-6 flex gap-2">
            <Badge variant="outline" className="text-xs">Gluten-Free Option</Badge>
            <Badge variant="outline" className="text-xs">Heart Healthy</Badge>
          </div>
        </div>

        <Separator />

        {/* Dinner */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold">Dinner (5:00 PM - 6:30 PM)</h3>
          </div>
          <div className="ml-6 space-y-1">
            <p className="text-sm">• Baked salmon with lemon dill sauce</p>
            <p className="text-sm">• Roasted sweet potatoes</p>
            <p className="text-sm">• Green beans almondine</p>
            <p className="text-sm">• Chocolate pudding for dessert</p>
          </div>
          <div className="ml-6 flex gap-2">
            <Badge variant="outline" className="text-xs">Omega-3 Rich</Badge>
            <Badge variant="outline" className="text-xs">Low Cholesterol</Badge>
          </div>
        </div>

        {/* Dietary Notes */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <span className="font-semibold">Dietary Notes:</span> Alternative options available for all dietary restrictions. 
            Snacks and beverages available throughout the day in the common area.
          </AlertDescription>
        </Alert>

        {viewMode === 'community' && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Update Menu
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Print Menu
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderWellnessCheck = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Daily Wellness
        </CardTitle>
        <CardDescription>
          Today's wellness status and mood tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Wellness Score */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Wellness Score</span>
            <span className="text-2xl font-bold text-green-600">92%</span>
          </div>
          <Progress value={92} className="h-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Excellent - All wellness indicators are positive today
          </p>
        </div>

        {/* Mood Tracking */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Mood & Engagement
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-1">😊</div>
              <p className="text-xs font-medium">Morning</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Happy</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-1">😌</div>
              <p className="text-xs font-medium">Afternoon</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Relaxed</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-1">😊</div>
              <p className="text-xs font-medium">Evening</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Content</p>
            </div>
          </div>
        </div>

        {/* Daily Metrics */}
        <div className="space-y-2">
          <h3 className="font-semibold">Daily Metrics</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Physical Activity
              </span>
              <Badge className="bg-green-100 text-green-700">45 min</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Social Interaction
              </span>
              <Badge className="bg-green-100 text-green-700">High</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                Meal Completion
              </span>
              <Badge className="bg-green-100 text-green-700">100%</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Medication Adherence
              </span>
              <Badge className="bg-green-100 text-green-700">On Track</Badge>
            </div>
          </div>
        </div>

        {/* Staff Notes */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">Staff Note:</span> Had a wonderful day! Participated actively in art class 
            and really enjoyed the piano performance. Great appetite at all meals.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">- Sarah M., Care Coordinator (3:45 PM)</p>
        </div>

        {viewMode === 'community' && (
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Wellness Update
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderPhotoGallery = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-500" />
              Photo Updates
            </CardTitle>
            <CardDescription>
              Recent photos and moments from daily life
            </CardDescription>
          </div>
          {viewMode === 'community' && (
            <Button onClick={() => setShowPhotoUpload(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="relative group cursor-pointer">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
                {viewMode === 'family' && (
                  <Button size="sm" variant="secondary">
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {i === 1 && "Art class creation"}
                {i === 2 && "Lunch with friends"}
                {i === 3 && "Morning exercise"}
                {i === 4 && "Garden walk"}
                {i === 5 && "Bingo winner!"}
                {i === 6 && "Birthday celebration"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {i <= 2 ? "Today" : i <= 4 ? "Yesterday" : "2 days ago"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline">
            View All Photos
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCommunication = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Communication Center
        </CardTitle>
        <CardDescription>
          Stay connected with messages and video calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => setShowMessageDialog(true)}
          >
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <span>Send Message</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Video className="w-6 h-6 text-green-500" />
            <span>Video Call</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Phone className="w-6 h-6 text-purple-500" />
            <span>Phone Call</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Camera className="w-6 h-6 text-orange-500" />
            <span>Share Photo</span>
          </Button>
        </div>

        {/* Recent Messages */}
        <div className="space-y-2">
          <h3 className="font-semibold">Recent Messages</h3>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">From: John (Son)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "Hi Mom! Hope you enjoyed the art class today. Can't wait to see your painting!"
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">2h ago</Badge>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">From: Sarah (Daughter)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "Thanks for the video call yesterday! The kids loved seeing you."
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">Yesterday</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Calls */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <span className="font-semibold">Scheduled Video Call:</span> Tomorrow at 3:00 PM with family
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Life Connection</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {viewMode === 'community' 
              ? 'Manage resident activities, meals, and daily updates'
              : 'Stay connected with daily activities and well-being'
            }
          </p>
        </div>
        {viewMode === 'family' && (
          <Badge className="bg-green-100 text-green-700">
            <Activity className="w-4 h-4 mr-1" />
            Live Updates
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="activities">
            <Calendar className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="meals">
            <Utensils className="w-4 h-4 mr-2" />
            Meals
          </TabsTrigger>
          <TabsTrigger value="wellness">
            <Heart className="w-4 h-4 mr-2" />
            Wellness
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="w-4 h-4 mr-2" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="connect">
            <MessageSquare className="w-4 h-4 mr-2" />
            Connect
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          {renderActivitySchedule()}
        </TabsContent>

        <TabsContent value="meals" className="mt-6">
          {renderMealMenu()}
        </TabsContent>

        <TabsContent value="wellness" className="mt-6">
          {renderWellnessCheck()}
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          {renderPhotoGallery()}
        </TabsContent>

        <TabsContent value="connect" className="mt-6">
          {renderCommunication()}
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to your loved one or care team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Select defaultValue="resident">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="care-team">Care Team</SelectItem>
                  <SelectItem value="family">Family Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea 
                placeholder="Type your message here..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => sendMessage.mutate({ 
                residentId, 
                message: "Test message" 
              })}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>
              Share a moment from today's activities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
            <div>
              <Label>Caption</Label>
              <Input placeholder="Add a caption..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPhotoUpload(false)}>
                Cancel
              </Button>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}