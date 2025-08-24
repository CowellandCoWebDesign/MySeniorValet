import { useState } from 'react';
import { useLocation, Link } from 'wouter';
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
import { 
  Calendar, 
  MessageCircle, 
  Heart, 
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
  Search
} from 'lucide-react';

export default function FamilyCollaborationCenter() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('tour-tracker');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newMessage, setNewMessage] = useState('');

  // Mock data for demonstration
  const upcomingTours = [
    {
      id: 1,
      community: 'Sunrise Senior Living',
      date: '2025-08-26',
      time: '10:00 AM',
      address: '123 Main St, Springfield',
      contact: 'Jane Smith',
      phone: '(555) 123-4567',
      notes: 'Ask about memory care unit'
    },
    {
      id: 2,
      community: 'Golden Years Residence',
      date: '2025-08-27',
      time: '2:00 PM',
      address: '456 Oak Ave, Riverside',
      contact: 'John Doe',
      phone: '(555) 987-6543',
      notes: 'Tour the rehabilitation center'
    }
  ];

  const visitHistory = [
    {
      id: 1,
      community: 'Peaceful Gardens',
      date: '2025-08-20',
      rating: 4,
      familyMember: 'Sarah Johnson',
      notes: 'Beautiful facility, staff was very friendly. Activities program looks excellent.',
      pros: ['Clean facilities', 'Friendly staff', 'Good food'],
      cons: ['Limited parking', 'Older building'],
      wouldRecommend: true
    },
    {
      id: 2,
      community: 'Harmony House',
      date: '2025-08-18',
      rating: 5,
      familyMember: 'Michael Johnson',
      notes: 'Exceeded expectations. Modern amenities and caring staff.',
      pros: ['Modern facilities', 'Excellent care', 'Great location'],
      cons: ['Higher cost'],
      wouldRecommend: true
    }
  ];

  const familyMessages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      avatar: 'SJ',
      message: 'I visited Peaceful Gardens today. Really impressed with their memory care program!',
      timestamp: '2 hours ago',
      isCurrentUser: false
    },
    {
      id: 2,
      sender: 'You',
      avatar: 'ME',
      message: 'That\'s great! What did you think about the pricing?',
      timestamp: '1 hour ago',
      isCurrentUser: true
    },
    {
      id: 3,
      sender: 'Michael Johnson',
      avatar: 'MJ',
      message: 'The pricing seems reasonable for the level of care. I can share the breakdown.',
      timestamp: '30 minutes ago',
      isCurrentUser: false
    }
  ];

  const sharedFavorites = [
    {
      id: 1,
      name: 'Sunrise Senior Living',
      location: 'Springfield, IL',
      price: '$4,500/month',
      rating: 4.5,
      familyRating: 4,
      notes: 'Top choice - great memory care',
      addedBy: 'Sarah'
    },
    {
      id: 2,
      name: 'Golden Years Residence',
      location: 'Riverside, CA',
      price: '$3,800/month',
      rating: 4.2,
      familyRating: 3.5,
      notes: 'Good value, needs more activities',
      addedBy: 'Michael'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
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
                <p className="text-sm text-muted-foreground">Work together to find the perfect care</p>
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
        {/* Example Data Notice */}
        <Card className="mb-6 border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Demo Mode - Example Data Only
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The data shown below is example content for demonstration purposes. 
                  Sign in to access your real family collaboration features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full max-w-4xl mx-auto">
            <TabsTrigger value="tour-tracker" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Tour Tracker
            </TabsTrigger>
            <TabsTrigger value="tourmate" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              TourMate™
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>

          {/* Tour Tracker Tab */}
          <TabsContent value="tour-tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Tour Visit Reports
                  <Badge variant="destructive" className="ml-2">EXAMPLE DATA</Badge>
                </CardTitle>
                <CardDescription>Track and review your community visits</CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  TourMate™ Scheduler
                  <Badge variant="destructive" className="ml-2">EXAMPLE DATA</Badge>
                </CardTitle>
                <CardDescription>Schedule and manage community tours</CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                  Family Messages
                  <Badge variant="destructive" className="ml-2">EXAMPLE DATA</Badge>
                </CardTitle>
                <CardDescription>Private chat for family care discussions</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 mb-4">
                    {familyMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.isCurrentUser ? 'justify-end' : ''}`}
                      >
                        {!msg.isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            msg.isCurrentUser ? 'order-first' : ''
                          }`}
                        >
                          <div
                            className={`rounded-lg p-3 ${
                              msg.isCurrentUser
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.sender} • {msg.timestamp}
                          </p>
                        </div>
                        {msg.isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setNewMessage('');
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    onClick={() => setNewMessage('')}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shared Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Shared Favorites
                  <Badge variant="destructive" className="ml-2">EXAMPLE DATA</Badge>
                </CardTitle>
                <CardDescription>Communities your family is considering</CardDescription>
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
        </Tabs>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}