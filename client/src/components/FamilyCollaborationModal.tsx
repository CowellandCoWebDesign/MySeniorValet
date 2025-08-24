import React, { useState } from 'react';
import { 
  X, Calendar, MessageSquare, FileText, Heart, DollarSign, 
  MapPin, Users, Clock, Star, CheckCircle, ChevronRight,
  Send, Plus, Trash2, Bell, Filter, Download, Share2,
  Video, Phone, Mail, AlertCircle, TrendingUp, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface FamilyCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FamilyCollaborationModal({ isOpen, onClose }: FamilyCollaborationModalProps) {
  const [activeTab, setActiveTab] = useState('tourmate');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [messageText, setMessageText] = useState('');
  const { toast } = useToast();

  // Sample data for demonstration
  const scheduledTours = [
    {
      id: 1,
      community: 'Sunset Gardens Senior Living',
      date: '2025-01-10',
      time: '10:00 AM',
      status: 'confirmed',
      address: '123 Peaceful Lane, Sacramento, CA',
      contact: 'Sarah Johnson',
      notes: 'Ask about memory care unit'
    },
    {
      id: 2,
      community: 'Golden Years Residence',
      date: '2025-01-11',
      time: '2:00 PM', 
      status: 'pending',
      address: '456 Oak Street, Roseville, CA',
      contact: 'Mike Thompson',
      notes: 'Tour assisted living facilities'
    }
  ];

  const tourReports = [
    {
      id: 1,
      community: 'Sunrise Manor',
      visitDate: '2024-12-20',
      rating: 4.5,
      pros: ['Beautiful grounds', 'Friendly staff', 'Good activities program'],
      cons: ['Limited parking', 'Older facility'],
      notes: 'Mom really liked the garden area and craft room',
      addedBy: 'John',
      photos: 3
    },
    {
      id: 2,
      community: 'Harmony House',
      visitDate: '2024-12-18',
      rating: 4.0,
      pros: ['Modern facilities', 'Excellent dining', 'Medical staff on-site'],
      cons: ['Higher price point', 'Waitlist for memory care'],
      notes: 'Very impressed with the medical facilities',
      addedBy: 'Sarah',
      photos: 5
    }
  ];

  const familyMessages = [
    {
      id: 1,
      sender: 'Sarah',
      avatar: 'S',
      message: 'Just toured Sunset Gardens - really impressed with their memory care program!',
      timestamp: '2 hours ago',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      avatar: 'Y',
      message: 'That\'s great! Did you ask about the pricing for the memory care unit?',
      timestamp: '1 hour ago',
      isOwn: true
    },
    {
      id: 3,
      sender: 'John',
      avatar: 'J',
      message: 'I\'ve scheduled us all for a group tour at Golden Years this Saturday at 2pm',
      timestamp: '30 minutes ago',
      isOwn: false
    }
  ];

  const sharedFavorites = [
    {
      id: 1,
      name: 'Sunset Gardens Senior Living',
      location: 'Sacramento, CA',
      price: '$4,500-$7,200/mo',
      rating: 4.7,
      careTypes: ['Memory Care', 'Assisted Living'],
      addedBy: 'Sarah',
      notes: 'Top choice - great memory care program',
      familyRating: 5
    },
    {
      id: 2,
      name: 'Golden Years Residence',
      location: 'Roseville, CA', 
      price: '$3,800-$6,500/mo',
      rating: 4.5,
      careTypes: ['Independent Living', 'Assisted Living'],
      addedBy: 'John',
      notes: 'Good value, nice location',
      familyRating: 4
    }
  ];

  const costComparisons = [
    {
      community: 'Sunset Gardens',
      monthlyCost: 6800,
      entranceFee: 2500,
      careLevel: 'Memory Care',
      includes: ['Meals', 'Activities', 'Medication Management', 'Laundry'],
      additional: ['Physical Therapy: $200/mo', 'Hair Salon: $50/visit']
    },
    {
      community: 'Golden Years',
      monthlyCost: 5200,
      entranceFee: 1500,
      careLevel: 'Assisted Living',
      includes: ['Meals', 'Activities', 'Transportation', 'Housekeeping'],
      additional: ['Medication Management: $150/mo', 'Pet Fee: $50/mo']
    }
  ];

  const handleScheduleTour = () => {
    if (!selectedCommunity || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all tour details",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Tour Scheduled!",
      description: `Tour at ${selectedCommunity} scheduled for ${selectedDate} at ${selectedTime}`,
    });
    
    // Reset form
    setSelectedCommunity('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    toast({
      title: "Message Sent",
      description: "Your message has been shared with the family",
    });
    
    setMessageText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                Family Collaboration Center
              </DialogTitle>
              <DialogDescription className="text-white/90 text-lg mt-2">
                Coordinate senior care decisions with your family using TourMate™ scheduling, Tour Tracker reports, and instant messaging
              </DialogDescription>
            </DialogHeader>
            <Button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-0"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="w-full justify-start px-6 py-6 bg-gray-50 dark:bg-gray-800 rounded-none">
                <TabsTrigger value="tourmate" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  TourMate™
                </TabsTrigger>
                <TabsTrigger value="tracker" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Tour Tracker
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Family Chat
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Shared Favorites
                </TabsTrigger>
                <TabsTrigger value="costs" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Compare
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100%-80px)]">
                {/* TourMate Tab */}
                <TabsContent value="tourmate" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Schedule New Tour */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5 text-rose-500" />
                          Schedule New Tour
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Community</label>
                          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a community" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunset-gardens">Sunset Gardens Senior Living</SelectItem>
                              <SelectItem value="golden-years">Golden Years Residence</SelectItem>
                              <SelectItem value="harmony-house">Harmony House</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Date</label>
                            <Input 
                              type="date" 
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Time</label>
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                                <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                                <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                                <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Notes for Family</label>
                          <Textarea 
                            placeholder="What should we focus on during this tour?"
                            className="resize-none"
                            rows={3}
                          />
                        </div>

                        <Button 
                          onClick={handleScheduleTour}
                          className="w-full bg-rose-500 hover:bg-rose-600"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Tour
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Upcoming Tours */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          Upcoming Tours
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {scheduledTours.map((tour) => (
                          <div key={tour.id} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-sm">{tour.community}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{tour.address}</p>
                              </div>
                              <Badge variant={tour.status === 'confirmed' ? 'default' : 'secondary'}>
                                {tour.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {tour.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tour.time}
                              </span>
                            </div>
                            {tour.notes && (
                              <p className="text-xs italic text-gray-500">Note: {tour.notes}</p>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                Directions
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tour Calendar View */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Family Tour Calendar</CardTitle>
                      <CardDescription>All scheduled tours at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Calendar view coming soon - see all family tours in one place
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tour Tracker Tab */}
                <TabsContent value="tracker" className="p-6 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Tour Reports & Reviews</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {tourReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{report.community}</CardTitle>
                            <CardDescription>
                              Visited on {report.visitDate} by {report.addedBy}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{report.rating}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-green-600 mb-2">Pros</h4>
                            <ul className="space-y-1">
                              {report.pros.map((pro, idx) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-red-600 mb-2">Cons</h4>
                            <ul className="space-y-1">
                              {report.cons.map((con, idx) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Family Notes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{report.notes}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="secondary">
                            {report.photos} photos attached
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Full Report
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Family Chat Tab */}
                <TabsContent value="chat" className="p-6 h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>Family Discussion</CardTitle>
                      <CardDescription>Private messaging for your family's senior care journey</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Messages */}
                      <ScrollArea className="flex-1 pr-4 mb-4">
                        <div className="space-y-4">
                          {familyMessages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`flex items-start gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{msg.avatar}</AvatarFallback>
                              </Avatar>
                              <div className={`flex-1 max-w-md ${msg.isOwn ? 'text-right' : ''}`}>
                                <div className="text-xs text-gray-500 mb-1">
                                  {msg.sender} • {msg.timestamp}
                                </div>
                                <div className={`inline-block p-3 rounded-lg ${
                                  msg.isOwn 
                                    ? 'bg-rose-500 text-white' 
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type a message to your family..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          className="bg-rose-500 hover:bg-rose-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Shared Favorites Tab */}
                <TabsContent value="favorites" className="p-6 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Family's Favorite Communities</h3>
                    <Badge className="bg-rose-100 text-rose-700">
                      {sharedFavorites.length} Saved
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sharedFavorites.map((fav) => (
                      <Card key={fav.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{fav.name}</CardTitle>
                              <CardDescription>{fav.location}</CardDescription>
                            </div>
                            <Button size="icon" variant="ghost">
                              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{fav.price}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{fav.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {fav.careTypes.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Family Rating</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < fav.familyRating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              Added by {fav.addedBy}: "{fav.notes}"
                            </p>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              Schedule Tour
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Cost Comparison Tab */}
                <TabsContent value="costs" className="p-6 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Cost Comparison Tool</h3>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {costComparisons.map((cost, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg">{cost.community}</CardTitle>
                          <CardDescription>{cost.careLevel}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Monthly Cost</span>
                              <span className="text-xl font-bold text-green-600">
                                ${cost.monthlyCost.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Entrance Fee</span>
                              <span className="text-sm">${cost.entranceFee.toLocaleString()}</span>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="text-sm font-semibold mb-2">Included Services</h4>
                            <div className="grid grid-cols-2 gap-1">
                              {cost.includes.map((item) => (
                                <div key={item} className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold mb-2">Additional Costs</h4>
                            <ul className="space-y-1">
                              {cost.additional.map((item) => (
                                <li key={item} className="text-xs text-gray-600 dark:text-gray-400">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Annual Total</span>
                                <span className="text-lg font-bold">
                                  ${((cost.monthlyCost * 12) + cost.entranceFee).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Cost Summary */}
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Budget Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly</p>
                          <p className="text-2xl font-bold text-blue-600">$6,000</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Lowest Option</p>
                          <p className="text-2xl font-bold text-green-600">$5,200</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Highest Option</p>
                          <p className="text-2xl font-bold text-orange-600">$6,800</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-700">
                  FREE FOR FAMILIES ALWAYS
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  All collaboration features included at no cost
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Family
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}