import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { 
  Video,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Link,
  Copy,
  Settings,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  User,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VideoCallingInterfaceProps {
  communityId: number;
}

export function VideoCallingInterface({ communityId }: VideoCallingInterfaceProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    roomName: '',
    purpose: 'family_visit',
    scheduledAt: new Date(),
    maxParticipants: 10,
    requiresApproval: false,
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch video calls
  const { data: videoCalls = [], isLoading } = useQuery({
    queryKey: [`/api/resident-family/communities/${communityId}/video-calls`],
    enabled: !!communityId
  });

  // Schedule video call mutation
  const scheduleCallMutation = useMutation({
    mutationFn: async (callData: any) => {
      const response = await apiRequest('POST', '/api/resident-family/video-calls', {
        ...callData,
        communityId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Call Scheduled",
        description: "Video call has been scheduled successfully",
      });
      setScheduleDialogOpen(false);
      setScheduleData({
        roomName: '',
        purpose: 'family_visit',
        scheduledAt: new Date(),
        maxParticipants: 10,
        requiresApproval: false,
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/video-calls`] });
    }
  });

  // Start call mutation
  const startCallMutation = useMutation({
    mutationFn: async (callId: number) => {
      const response = await apiRequest('PUT', `/api/resident-family/video-calls/${callId}/start`);
      return response.json();
    },
    onSuccess: (data) => {
      window.open(data.meetingUrl, '_blank');
      toast({
        title: "Call Started",
        description: "Opening video call in new window",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/video-calls`] });
    }
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async (callId: number) => {
      const response = await apiRequest('PUT', `/api/resident-family/video-calls/${callId}/end`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Call Ended",
        description: "Video call has been ended",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/video-calls`] });
    }
  });

  const upcomingCalls = videoCalls.filter((call: any) => call.status === 'scheduled');
  const activeCalls = videoCalls.filter((call: any) => call.status === 'active');
  const completedCalls = videoCalls.filter((call: any) => call.status === 'completed');

  const getCallStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Scheduled</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500"><Video className="mr-1 h-3 w-3" />Active</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default:
        return null;
    }
  };

  const formatCallTime = (date: string) => {
    const callDate = new Date(date);
    if (isToday(callDate)) {
      return `Today at ${format(callDate, 'h:mm a')}`;
    } else if (isTomorrow(callDate)) {
      return `Tomorrow at ${format(callDate, 'h:mm a')}`;
    } else {
      return format(callDate, 'MMM d at h:mm a');
    }
  };

  const copyJoinLink = (sessionId: string) => {
    const link = `${window.location.origin}/video/${sessionId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Video call link has been copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Video Calling Center</h3>
          <p className="text-sm text-muted-foreground">
            Schedule and manage video calls with residents
          </p>
        </div>
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Video className="mr-2 h-4 w-4" />
              Schedule Call
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Schedule Video Call</DialogTitle>
              <DialogDescription>
                Set up a video call session for family visits or consultations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="Family Visit - Smith"
                  value={scheduleData.roomName}
                  onChange={(e) => setScheduleData({ ...scheduleData, roomName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={scheduleData.purpose}
                  onValueChange={(value) => setScheduleData({ ...scheduleData, purpose: value })}
                >
                  <SelectTrigger id="purpose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family_visit">Family Visit</SelectItem>
                    <SelectItem value="medical_consultation">Medical Consultation</SelectItem>
                    <SelectItem value="activity">Group Activity</SelectItem>
                    <SelectItem value="celebration">Celebration/Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={format(scheduleData.scheduledAt, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      date.setHours(scheduleData.scheduledAt.getHours());
                      date.setMinutes(scheduleData.scheduledAt.getMinutes());
                      setScheduleData({ ...scheduleData, scheduledAt: date });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={format(scheduleData.scheduledAt, 'HH:mm')}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const date = new Date(scheduleData.scheduledAt);
                      date.setHours(parseInt(hours));
                      date.setMinutes(parseInt(minutes));
                      setScheduleData({ ...scheduleData, scheduledAt: date });
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or topics to discuss..."
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => scheduleCallMutation.mutate(scheduleData)}>
                Schedule Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Calls Alert */}
      {activeCalls.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <CardTitle className="text-base">{activeCalls.length} Active Call{activeCalls.length > 1 ? 's' : ''}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeCalls.map((call: any) => (
                <div key={call.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{call.roomName}</p>
                      <p className="text-xs text-muted-foreground">
                        Started {format(new Date(call.startedAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startCallMutation.mutate(call.id)}>
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Join
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => endCallMutation.mutate(call.id)}>
                      <PhoneOff className="mr-2 h-3 w-3" />
                      End
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingCalls.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCalls.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingCalls.length > 0 ? (
              upcomingCalls.map((call: any) => (
                <Card key={call.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{call.roomName}</CardTitle>
                      {getCallStatusBadge(call.status)}
                    </div>
                    <CardDescription>{formatCallTime(call.scheduledAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Max {call.maxParticipants} participants</span>
                      </div>
                      {call.purpose && (
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{call.purpose.replace('_', ' ')}</span>
                        </div>
                      )}
                      {call.notes && (
                        <p className="text-sm text-muted-foreground">{call.notes}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => startCallMutation.mutate(call.id)}
                        >
                          <Play className="mr-2 h-3 w-3" />
                          Start Call
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyJoinLink(call.sessionId)}
                        >
                          <Link className="mr-2 h-3 w-3" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No upcoming calls</p>
                  <p className="text-sm text-muted-foreground">Schedule a call to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {completedCalls.length > 0 ? (
                completedCalls.map((call: any) => (
                  <Card key={call.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{call.roomName}</CardTitle>
                          <CardDescription>
                            {format(new Date(call.scheduledAt), 'PPP')} • Duration: {call.duration ? `${Math.round(call.duration / 60)} minutes` : 'N/A'}
                          </CardDescription>
                        </div>
                        {call.isRecorded && (
                          <Badge variant="secondary">
                            <Video className="mr-1 h-3 w-3" />
                            Recorded
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    {call.participants && call.participants.length > 0 && (
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{call.participants.length} participants</span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No completed calls</p>
                    <p className="text-sm text-muted-foreground">Completed calls will appear here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Calendar</CardTitle>
              <CardDescription>View scheduled calls on the calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="flex-1">
                  <h4 className="font-medium mb-3">
                    Calls on {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  </h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {selectedDate && videoCalls
                        .filter((call: any) => {
                          const callDate = new Date(call.scheduledAt);
                          return (
                            callDate.getDate() === selectedDate.getDate() &&
                            callDate.getMonth() === selectedDate.getMonth() &&
                            callDate.getFullYear() === selectedDate.getFullYear()
                          );
                        })
                        .map((call: any) => (
                          <div key={call.id} className="p-2 border rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{call.roomName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(call.scheduledAt), 'h:mm a')}
                                </p>
                              </div>
                              {getCallStatusBadge(call.status)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}