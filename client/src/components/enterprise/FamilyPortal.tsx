import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, MessageSquare, Calendar, FileText, Image, Video,
  Bell, Heart, Activity, Clock, Send, Paperclip, Phone,
  MapPin, Star, ChevronRight, Download, Share2, Settings,
  User, Camera, Info, AlertCircle, CheckCircle, Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface FamilyPortalProps {
  communityId: number;
}

export function FamilyPortal({ communityId }: FamilyPortalProps) {
  const [selectedResident, setSelectedResident] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Family data query
  const { data: familyData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/family-portal', communityId],
  });

  // Mock family portal data - replace with real API data
  const mockPortal = {
    connectedFamilies: 142,
    activeUsers: 78,
    messagesThisWeek: 324,
    photosShared: 89,
    residents: [
      {
        id: 'R001',
        name: 'Margaret Thompson',
        room: '204A',
        status: 'stable',
        lastUpdate: '2 hours ago',
        avatar: null,
        careTeam: ['Dr. Sarah Johnson', 'Nurse Mike Chen'],
        familyMembers: [
          { name: 'John Thompson', relation: 'Son', lastActive: '1 hour ago' },
          { name: 'Emily Thompson', relation: 'Daughter', lastActive: '3 days ago' }
        ]
      },
      {
        id: 'R002',
        name: 'Robert Anderson',
        room: '312B',
        status: 'improving',
        lastUpdate: '4 hours ago',
        avatar: null,
        careTeam: ['Dr. Lisa Brown', 'Nurse Jane Wilson'],
        familyMembers: [
          { name: 'Susan Anderson', relation: 'Wife', lastActive: '30 min ago' },
          { name: 'Mark Anderson', relation: 'Son', lastActive: '2 days ago' }
        ]
      }
    ],
    recentUpdates: [
      {
        id: 1,
        type: 'health',
        title: 'Health Update',
        content: 'Margaret had a good day today. She participated in morning exercises and enjoyed lunch with friends.',
        resident: 'Margaret Thompson',
        timestamp: '2 hours ago',
        author: 'Nurse Sarah'
      },
      {
        id: 2,
        type: 'activity',
        title: 'Activity Participation',
        content: 'Robert joined the music therapy session this afternoon and really enjoyed it!',
        resident: 'Robert Anderson',
        timestamp: '4 hours ago',
        author: 'Activities Director'
      },
      {
        id: 3,
        type: 'photo',
        title: 'New Photos',
        content: '3 new photos from today\'s garden party have been shared.',
        resident: 'Community Event',
        timestamp: '6 hours ago',
        author: 'Staff'
      }
    ],
    messages: [
      {
        id: 1,
        sender: 'John Thompson',
        role: 'Family',
        content: 'Thank you for the update on mom. Can we schedule a video call tomorrow?',
        timestamp: '1 hour ago',
        read: false
      },
      {
        id: 2,
        sender: 'Nurse Sarah',
        role: 'Staff',
        content: 'Of course! I can arrange a video call at 2 PM tomorrow. Does that work?',
        timestamp: '45 min ago',
        read: true
      },
      {
        id: 3,
        sender: 'Susan Anderson',
        role: 'Family',
        content: 'Robert looks so happy in the photos! Thank you for sharing.',
        timestamp: '3 hours ago',
        read: true
      }
    ],
    events: [
      {
        id: 1,
        title: 'Family Council Meeting',
        date: '2025-09-05',
        time: '6:00 PM',
        type: 'meeting',
        description: 'Monthly family council meeting to discuss community updates'
      },
      {
        id: 2,
        title: 'Grandparents Day Celebration',
        date: '2025-09-08',
        time: '2:00 PM',
        type: 'event',
        description: 'Special celebration with activities and refreshments'
      },
      {
        id: 3,
        title: 'Care Plan Review - Margaret T.',
        date: '2025-09-10',
        time: '10:00 AM',
        type: 'care',
        description: 'Quarterly care plan review meeting'
      }
    ],
    documents: [
      { name: 'August Newsletter', type: 'newsletter', date: '2025-08-01', size: '2.4 MB' },
      { name: 'Care Plan - Margaret T.', type: 'care_plan', date: '2025-07-15', size: '856 KB' },
      { name: 'Activity Calendar - September', type: 'calendar', date: '2025-08-28', size: '1.2 MB' },
      { name: 'Billing Statement - August', type: 'billing', date: '2025-08-31', size: '342 KB' }
    ],
    photoAlbums: [
      { name: 'Garden Party', photos: 24, date: '2025-08-28', cover: null },
      { name: 'Music Therapy Session', photos: 12, date: '2025-08-27', cover: null },
      { name: 'Birthday Celebrations', photos: 18, date: '2025-08-25', cover: null }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable':
        return <Badge className="bg-green-500">Stable</Badge>;
      case 'improving':
        return <Badge className="bg-blue-500">Improving</Badge>;
      case 'monitoring':
        return <Badge className="bg-yellow-500">Monitoring</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'photo':
        return <Image className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'care':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Family Portal</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Connect with residents, receive updates, and stay informed
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button>
            <Video className="w-4 h-4 mr-2" />
            Schedule Video Call
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connected Families</p>
                <p className="text-2xl font-bold">{mockPortal.connectedFamilies}</p>
                <p className="text-xs text-gray-500 mt-1">{mockPortal.activeUsers} active today</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                <p className="text-2xl font-bold">{mockPortal.messagesThisWeek}</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Photos Shared</p>
                <p className="text-2xl font-bold">{mockPortal.photosShared}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <Image className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</p>
                <p className="text-2xl font-bold">{mockPortal.events.length}</p>
                <p className="text-xs text-gray-500 mt-1">Next 2 weeks</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Portal Tabs */}
      <Tabs defaultValue="residents" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Residents Tab */}
        <TabsContent value="residents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockPortal.residents.map((resident) => (
              <Card key={resident.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={resident.avatar} />
                        <AvatarFallback>{resident.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{resident.name}</CardTitle>
                        <CardDescription>Room {resident.room}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(resident.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Update</span>
                      <span className="font-medium">{resident.lastUpdate}</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Care Team</p>
                      <div className="flex flex-wrap gap-2">
                        {resident.careTeam.map((member, index) => (
                          <Badge key={index} variant="outline">{member}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Family Members</p>
                      <div className="space-y-1">
                        {resident.familyMembers.map((family, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{family.name} ({family.relation})</span>
                            <span className="text-gray-500">Active {family.lastActive}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Latest news about your loved ones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPortal.recentUpdates.map((update) => (
                  <div key={update.id} className="flex items-start space-x-3 p-3 border rounded">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      {getUpdateIcon(update.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{update.title}</p>
                        <span className="text-xs text-gray-500">{update.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{update.content}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>{update.resident}</span>
                        <span>•</span>
                        <span>By {update.author}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Conversation List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {mockPortal.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !message.read ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => setActiveConversation(message.id.toString())}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{message.sender}</p>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {message.content}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">{message.role}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message Thread */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Message Thread</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px] mb-4">
                  {activeConversation ? (
                    <div className="space-y-3">
                      {mockPortal.messages
                        .filter(m => m.id.toString() === activeConversation)
                        .map((message) => (
                          <div key={message.id} className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{message.sender[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-sm">{message.sender}</p>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 mt-8">Select a conversation to view messages</p>
                  )}
                </ScrollArea>
                <div className="flex items-center space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Community events and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPortal.events.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border rounded">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{event.title}</p>
                        <Button size="sm" variant="outline">RSVP</Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Albums</CardTitle>
              <CardDescription>Shared memories and moments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockPortal.photoAlbums.map((album, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-3">
                      <p className="font-medium">{album.name}</p>
                      <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                        <span>{album.photos} photos</span>
                        <span>{album.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Important Documents</CardTitle>
              <CardDescription>Care plans, newsletters, and statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPortal.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}