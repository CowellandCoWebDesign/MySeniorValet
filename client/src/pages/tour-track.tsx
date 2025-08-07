import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Star,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Trophy,
  Target,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface Tour {
  id: string;
  familyName: string;
  familyEmail: string;
  familyPhone: string;
  tourDate: Date;
  tourTime: string;
  tourGuide: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  rating?: number;
  review?: string;
  followUpStatus?: 'pending' | 'contacted' | 'applied' | 'moved-in' | 'not-interested';
  notes?: string;
  createdAt: Date;
}

interface TourStats {
  totalTours: number;
  completedTours: number;
  averageRating: number;
  conversionRate: number;
  topRatedAspects: string[];
  commonConcerns: string[];
}

export default function TourTrack() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  // Mock data for demonstration
  const mockTours: Tour[] = [
    {
      id: '1',
      familyName: 'Johnson Family',
      familyEmail: 'johnson@email.com',
      familyPhone: '(555) 123-4567',
      tourDate: new Date(),
      tourTime: '10:00 AM',
      tourGuide: 'Sarah Miller',
      status: 'completed',
      rating: 5,
      review: 'Wonderful tour! Sarah was very knowledgeable and the facility exceeded our expectations.',
      followUpStatus: 'applied',
      createdAt: new Date()
    },
    {
      id: '2',
      familyName: 'Smith Family',
      familyEmail: 'smith@email.com',
      familyPhone: '(555) 987-6543',
      tourDate: new Date(),
      tourTime: '2:00 PM',
      tourGuide: 'Mike Thompson',
      status: 'scheduled',
      followUpStatus: 'pending',
      createdAt: new Date()
    }
  ];

  const mockStats: TourStats = {
    totalTours: 156,
    completedTours: 142,
    averageRating: 4.7,
    conversionRate: 68,
    topRatedAspects: ['Cleanliness', 'Staff Friendliness', 'Amenities'],
    commonConcerns: ['Pricing transparency', 'Available rooms', 'Medical services']
  };

  const scheduleTour = () => {
    toast({
      title: "Tour Scheduled!",
      description: "The family will receive a confirmation email with tour details."
    });
    setShowScheduleModal(false);
  };

  const sendReviewRequest = (tour: Tour) => {
    toast({
      title: "Review Request Sent",
      description: `Review request sent to ${tour.familyName}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tour Track™
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced tour management and review system
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tours</p>
                    <p className="text-2xl font-bold">{mockStats.totalTours}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{mockStats.averageRating}</p>
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
                    <p className="text-2xl font-bold">{mockStats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Today's Tours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Today's Tours
                  </span>
                  <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                    Schedule Tour
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTours.filter(t => t.tourDate.toDateString() === new Date().toDateString()).map(tour => (
                  <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{tour.familyName}</h4>
                        <Badge variant={tour.status === 'completed' ? 'default' : 'secondary'}>
                          {tour.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {tour.tourTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tour.tourGuide}
                        </span>
                        {tour.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {tour.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {tour.status === 'completed' && !tour.rating && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendReviewRequest(tour)}
                        >
                          Request Review
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                    Top Rated Aspects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStats.topRatedAspects.map((aspect, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{aspect}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Common Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStats.commonConcerns.map((concern, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{concern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Tour Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      Tours for {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-3">
                      {mockTours.filter(t => 
                        t.tourDate.toDateString() === selectedDate.toDateString()
                      ).map(tour => (
                        <div key={tour.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{tour.tourTime}</span>
                            <Badge>{tour.status}</Badge>
                          </div>
                          <p className="text-sm">{tour.familyName}</p>
                          <p className="text-xs text-gray-500">Guide: {tour.tourGuide}</p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => setShowScheduleModal(true)}>
                      Schedule New Tour
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Tour Reviews</span>
                  <Badge variant="secondary">
                    {mockStats.averageRating} ⭐ Average
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTours.filter(t => t.rating).map(tour => (
                  <Card key={tour.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{tour.familyName}</h4>
                          <p className="text-sm text-gray-500">
                            Tour on {format(tour.tourDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < (tour.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {tour.review && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{tour.review}"
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">
                          Tour Guide: {tour.tourGuide}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {tour.followUpStatus === 'applied' ? 'Applied' : 
                           tour.followUpStatus === 'moved-in' ? 'Moved In' :
                           'Following Up'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Review Highlights */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Review Insights</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">92%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Would recommend
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">4.7/5</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Staff rating
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">85%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Facility cleanliness
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Tour Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Tours Scheduled</span>
                        <span className="font-semibold">156</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Tours Completed</span>
                        <span className="font-semibold">142</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Applications</span>
                        <span className="font-semibold">97</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Move-ins</span>
                        <span className="font-semibold">68</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '44%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tour Guide Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Tour Guide Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Sarah Miller</p>
                        <p className="text-sm text-gray-500">42 tours</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">4.9</span>
                        </div>
                        <p className="text-xs text-green-600">78% conversion</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Mike Thompson</p>
                        <p className="text-sm text-gray-500">38 tours</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">4.7</span>
                        </div>
                        <p className="text-xs text-green-600">72% conversion</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Lisa Chen</p>
                        <p className="text-sm text-gray-500">35 tours</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">4.8</span>
                        </div>
                        <p className="text-xs text-green-600">75% conversion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Avg Response Time</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">+23%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Tour Growth</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">3.2</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Avg Group Size</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">Top 10%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Industry Ranking</p>
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