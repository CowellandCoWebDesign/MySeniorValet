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

  // Real families data from API
  const { data: familyData, isLoading, refetch } = useQuery({
    queryKey: [`/api/enterprise/families/${communityId}`],
  });

  // Use real family data from API with fallbacks
  const portal = familyData ? {
    connectedFamilies: familyData.summary?.totalFamilies || 0,
    activeUsers: familyData.summary?.withPortalAccess || 0,
    messagesThisWeek: 0, // Will be calculated from messaging data
    photosShared: 0, // Will be calculated from media data
    residents: familyData.families?.reduce((acc, family) => {
      const residentId = family.resident?.id;
      if (!residentId || acc.some(r => r.id === residentId)) return acc;
      
      const resident = family.resident;
      const familyMembers = familyData.families
        .filter(f => f.resident?.id === residentId)
        .map(f => ({
          name: `${f.family.firstName} ${f.family.lastName}`,
          relation: f.family.relationship,
          lastActive: f.family.lastPortalAccess || 'Never'
        }));
      
      return [...acc, {
        id: residentId,
        name: resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown',
        room: resident?.roomNumber || 'N/A',
        status: resident?.status || 'unknown',
        lastUpdate: 'N/A',
        avatar: resident?.photoUrl || null,
        careTeam: [],
        familyMembers
      }];
    }, []) || [],
    primaryContacts: familyData.summary?.primaryContacts || 0,
    emergencyContacts: familyData.summary?.emergencyContacts || 0
  } : {
    // Fallback structure when no data
    connectedFamilies: 0,
    activeUsers: 0,
    messagesThisWeek: 0,
    photosShared: 0,
    residents: [],
    recentUpdates: [],
    messages: [],
        timestamp: '1 hour ago',
        read: false
    events: [],
    documents: [],
    photoAlbums: []
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
                <p className="text-2xl font-bold">{portal.connectedFamilies}</p>
                <p className="text-xs text-gray-500 mt-1">{portal.activeUsers} active today</p>
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
                <p className="text-2xl font-bold">{portal.messagesThisWeek}</p>
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
                <p className="text-2xl font-bold">{portal.photosShared}</p>
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
                <p className="text-2xl font-bold">{portal.events.length}</p>
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
            {portal.residents.map((resident) => (
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
                {portal.recentUpdates.map((update) => (
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
                    {portal.messages.map((message) => (
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
                      {portal.messages
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
                {portal.events.map((event) => (
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
                {portal.photoAlbums.map((album, index) => (
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
                {portal.documents.map((doc, index) => (
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