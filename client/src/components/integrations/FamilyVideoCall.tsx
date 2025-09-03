import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  PhoneOff,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  CheckCircle,
  Settings,
  Shield,
  Monitor,
  Smartphone,
  Globe,
  ChevronRight,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyVideoCallProps {
  familyId?: string;
  userId?: string;
}

export function FamilyVideoCall({ familyId = 'demo', userId = 'demo' }: FamilyVideoCallProps) {
  const { toast } = useToast();
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Demo family members
  const familyMembers = [
    { id: 1, name: 'Sarah Johnson', role: 'Daughter', status: 'online', avatar: 'SJ', location: 'New York' },
    { id: 2, name: 'Michael Johnson', role: 'Son', status: 'online', avatar: 'MJ', location: 'Chicago' },
    { id: 3, name: 'Emily Johnson', role: 'Daughter', status: 'offline', avatar: 'EJ', location: 'Los Angeles' },
    { id: 4, name: 'Robert Johnson', role: 'Son', status: 'busy', avatar: 'RJ', location: 'Boston' }
  ];

  // Scheduled calls
  const scheduledCalls = [
    {
      id: 1,
      title: 'Family Discussion - Peaceful Gardens Tour',
      date: 'Tomorrow',
      time: '2:00 PM EST',
      participants: ['Sarah', 'Michael', 'Emily'],
      meetingId: 'zoom-123-456-789'
    },
    {
      id: 2,
      title: 'Review Golden Years Options',
      date: 'Friday, Dec 15',
      time: '6:00 PM EST',
      participants: ['All Family Members'],
      meetingId: 'zoom-987-654-321'
    }
  ];

  // Recent calls
  const recentCalls = [
    {
      id: 1,
      title: 'Initial Family Meeting',
      date: 'Dec 8, 2024',
      duration: '45 minutes',
      participants: 4,
      recording: true
    },
    {
      id: 2,
      title: 'Tour Debrief - Harmony House',
      date: 'Dec 5, 2024',
      duration: '30 minutes',
      participants: 3,
      recording: true
    }
  ];

  const startInstantMeeting = async () => {
    setActiveCall({
      id: 'instant-' + Date.now(),
      type: 'instant',
      startTime: new Date(),
      participants: []
    });

    // Generate Zoom meeting link
    const zoomLink = `https://zoom.us/j/${Math.random().toString(36).substring(7)}`;
    setMeetingLink(zoomLink);

    toast({
      title: "Meeting Started! 🎥",
      description: "Your family video call is ready. Share the link with family members.",
    });
  };

  const joinScheduledMeeting = (meetingId: string) => {
    setActiveCall({
      id: meetingId,
      type: 'scheduled',
      startTime: new Date(),
      participants: []
    });

    const zoomLink = `https://zoom.us/j/${meetingId}`;
    window.open(zoomLink, '_blank');

    toast({
      title: "Joining Meeting",
      description: "Opening Zoom in a new window...",
    });
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: "Link Copied!",
      description: "Meeting link copied to clipboard",
    });
  };

  const endCall = () => {
    setActiveCall(null);
    setMeetingLink('');
    
    toast({
      title: "Call Ended",
      description: "Your family video call has ended",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with instant meeting button */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Video className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Family Video Calls</h3>
                <p className="text-sm text-muted-foreground">
                  Connect face-to-face with your family to discuss care options
                </p>
              </div>
            </div>
            {!activeCall ? (
              <Button 
                size="lg" 
                onClick={startInstantMeeting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Instant Meeting
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white animate-pulse">
                  <Phone className="w-3 h-3 mr-1" />
                  Call in Progress
                </Badge>
                <Button variant="destructive" size="sm" onClick={endCall}>
                  <PhoneOff className="w-4 h-4 mr-1" />
                  End Call
                </Button>
              </div>
            )}
          </div>

          {/* Active Call Interface */}
          {activeCall && meetingLink && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">Meeting Room Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <MicOff className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <VideoOff className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Monitor className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Input 
                  value={meetingLink} 
                  readOnly 
                  className="flex-1 bg-transparent border-0"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyMeetingLink}
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(meetingLink, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Share this link with family members to join the call
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Family Members
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled Calls
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="w-4 h-4 mr-2" />
            Call History
          </TabsTrigger>
        </TabsList>

        {/* Family Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>
                See who's available for a video call
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role} • {member.location}
                        </p>
                      </div>
                    </div>
                    {member.status === 'online' && (
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Pro Tip: Schedule calls in advance
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      This ensures all family members can join and participate in important decisions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Calls Tab */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Calls</CardTitle>
                  <CardDescription>
                    Upcoming family video conferences
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsScheduling(true)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledCalls.map((call) => (
                <div key={call.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{call.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {call.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {call.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {Array.isArray(call.participants) ? call.participants.join(', ') : call.participants}
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => joinScheduledMeeting(call.meetingId)}
                    >
                      Join Call
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}

              {scheduledCalls.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No scheduled calls</p>
                  <p className="text-sm">Schedule a call to coordinate with your family</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Call History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Call History</CardTitle>
              <CardDescription>
                Previous family video conferences and recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCalls.map((call) => (
                <div key={call.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{call.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{call.date}</span>
                        <span>{call.duration}</span>
                        <span>{call.participants} participants</span>
                      </div>
                    </div>
                    {call.recording && (
                      <Badge variant="outline" className="gap-1">
                        <Monitor className="w-3 h-3" />
                        Recording Available
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Premium Video Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Secure & Private</p>
                <p className="text-sm text-muted-foreground">
                  End-to-end encrypted family discussions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Connect Anywhere</p>
                <p className="text-sm text-muted-foreground">
                  Family members can join from any location
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Screen Sharing</p>
                <p className="text-sm text-muted-foreground">
                  Share community photos and documents
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">HD Quality</p>
                <p className="text-sm text-muted-foreground">
                  Crystal clear video and audio quality
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}