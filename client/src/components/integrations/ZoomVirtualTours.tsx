import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { 
  Video, Calendar as CalendarIcon, Clock, Users, Link, Copy, 
  CheckCircle, AlertCircle, Send, Settings, RefreshCw, Plus,
  Edit, Trash2, Eye, EyeOff, Phone, Monitor, ChevronRight,
  Star, MessageSquare, Globe, Shield, Zap, TrendingUp
} from 'lucide-react';

interface ZoomVirtualToursProps {
  communityId: number;
  tierLevel: 'professional' | 'premium' | 'enterprise';
}

interface ScheduledTour {
  id: string;
  title: string;
  familyName: string;
  familyEmail: string;
  familyPhone?: string;
  scheduledDate: Date;
  duration: number;
  meetingUrl?: string;
  passcode?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  recordingUrl?: string;
}

export function ZoomVirtualTours({ communityId, tierLevel }: ZoomVirtualToursProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [tourForm, setTourForm] = useState({
    familyName: '',
    familyEmail: '',
    familyPhone: '',
    duration: '30',
    notes: '',
    sendReminder: true,
    recordTour: tierLevel === 'enterprise'
  });

  // Fetch scheduled tours
  const { data: toursData, isLoading: toursLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/virtual-tours`],
  });

  // Fetch Zoom integration status
  const { data: zoomStatus } = useQuery({
    queryKey: [`/api/communities/${communityId}/integrations/zoom/status`],
  });

  // Schedule virtual tour mutation
  const scheduleTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      return await apiRequest('POST', `/api/communications/zoom/virtual-tour`, {
        communityId,
        ...tourData
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Virtual Tour Scheduled",
        description: `Tour scheduled with ${tourForm.familyName}. Meeting link sent to ${tourForm.familyEmail}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/virtual-tours`] });
      setShowScheduleDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule virtual tour",
        variant: "destructive",
      });
    }
  });

  // Cancel tour mutation
  const cancelTourMutation = useMutation({
    mutationFn: async (tourId: string) => {
      return await apiRequest('DELETE', `/api/communications/zoom/virtual-tour/${tourId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tour Cancelled",
        description: "Virtual tour has been cancelled and family notified",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/virtual-tours`] });
    }
  });

  // Start instant meeting mutation
  const startInstantMeetingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/communications/zoom/instant-meeting`, {
        communityId,
        topic: `${toursData?.communityName || 'Community'} Virtual Tour`
      });
    },
    onSuccess: (data) => {
      window.open(data.joinUrl, '_blank');
      toast({
        title: "Meeting Started",
        description: "Your Zoom meeting is ready. Share the link with families.",
      });
    }
  });

  const resetForm = () => {
    setTourForm({
      familyName: '',
      familyEmail: '',
      familyPhone: '',
      duration: '30',
      notes: '',
      sendReminder: true,
      recordTour: tierLevel === 'enterprise'
    });
    setSelectedTimeSlot('');
  };

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = setMinutes(setHours(new Date(), hour), minute);
        slots.push(format(time, 'h:mm a'));
      }
    }
    return slots;
  };

  const scheduledTours = toursData?.tours || [];
  const upcomingTours = scheduledTours.filter((tour: ScheduledTour) => 
    tour.status === 'scheduled' && new Date(tour.scheduledDate) > new Date()
  );
  const pastTours = scheduledTours.filter((tour: ScheduledTour) => 
    tour.status === 'completed' || new Date(tour.scheduledDate) < new Date()
  );

  if (!zoomStatus?.isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Virtual Tours (Zoom)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>Connect your Zoom account to enable virtual tours.</p>
                <Button 
                  onClick={() => window.open('/api/communities/' + communityId + '/integrations/zoom/connect', '_blank')}
                  className="w-full"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Connect Zoom Account
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Virtual Tour Center
              </CardTitle>
              <CardDescription>
                Schedule and manage virtual tours with families
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                Zoom Connected
              </Badge>
              {tierLevel === 'enterprise' && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Zap className="w-3 h-3 mr-1" />
                  Recording Enabled
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setShowScheduleDialog(true)}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Schedule Tour</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => startInstantMeetingMutation.mutate()}
              disabled={startInstantMeetingMutation.isPending}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>Start Instant Tour</span>
            </Button>
            <Button 
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              <span>Tour Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Virtual Tours</span>
            <Badge>{upcomingTours.length} scheduled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTours.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No virtual tours scheduled</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowScheduleDialog(true)}
              >
                Schedule Your First Tour
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {upcomingTours.map((tour: ScheduledTour) => (
                  <div key={tour.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{tour.familyName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {tour.duration} min
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(tour.scheduledDate), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {format(new Date(tour.scheduledDate), 'h:mm a')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {tour.familyEmail}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => window.open(tour.meetingUrl, '_blank')}
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelTourMutation.mutate(tour.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Tour Analytics */}
      {tierLevel !== 'professional' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Virtual Tour Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {toursData?.analytics?.totalTours || 0}
                </p>
                <p className="text-sm text-gray-600">Total Tours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {toursData?.analytics?.conversionRate || 0}%
                </p>
                <p className="text-sm text-gray-600">Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {toursData?.analytics?.avgDuration || 0}m
                </p>
                <p className="text-sm text-gray-600">Avg Duration</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {toursData?.analytics?.satisfaction || 0}/5
                </p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Tour Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Virtual Tour</DialogTitle>
            <DialogDescription>
              Set up a Zoom virtual tour with a prospective family
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Family Name</Label>
                <Input
                  placeholder="John & Jane Smith"
                  value={tourForm.familyName}
                  onChange={(e) => setTourForm({...tourForm, familyName: e.target.value})}
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="family@example.com"
                  value={tourForm.familyEmail}
                  onChange={(e) => setTourForm({...tourForm, familyEmail: e.target.value})}
                />
              </div>
              <div>
                <Label>Phone (Optional)</Label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={tourForm.familyPhone}
                  onChange={(e) => setTourForm({...tourForm, familyPhone: e.target.value})}
                />
              </div>
              <div>
                <Label>Tour Duration</Label>
                <Select 
                  value={tourForm.duration}
                  onValueChange={(value) => setTourForm({...tourForm, duration: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label>Select Time</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Special requests or topics to cover..."
                value={tourForm.notes}
                onChange={(e) => setTourForm({...tourForm, notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={tourForm.sendReminder}
                  onChange={(e) => setTourForm({...tourForm, sendReminder: e.target.checked})}
                />
                <Label htmlFor="reminder" className="cursor-pointer">
                  Send reminder 1 hour before
                </Label>
              </div>
              {tierLevel === 'enterprise' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="record"
                    checked={tourForm.recordTour}
                    onChange={(e) => setTourForm({...tourForm, recordTour: e.target.checked})}
                  />
                  <Label htmlFor="record" className="cursor-pointer">
                    Record tour
                  </Label>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => scheduleTourMutation.mutate({
                  ...tourForm,
                  scheduledDate: selectedDate,
                  scheduledTime: selectedTimeSlot
                })}
                disabled={!tourForm.familyName || !tourForm.familyEmail || !selectedDate || !selectedTimeSlot}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Tour
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}