import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isFuture, isToday, isTomorrow } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  X, 
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  UserCheck,
  Users,
  Star,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';

interface Tour {
  id: number;
  communityId: number;
  tourDate: string;
  tourType: 'in_person' | 'virtual' | 'group' | 'private';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  attendeeCount: number;
  specialRequests?: string;
  contactPreference: 'email' | 'phone' | 'text';
  reminderSent: boolean;
  feedbackSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
  community: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    imageUrl?: string;
  };
}

export default function MyTours() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [feedback, setFeedback] = useState({
    overallImpression: '',
    tourNotes: '',
    pricingInfo: '',
    overallRating: 5,
    wouldRecommend: true,
    likelihood: 'likely'
  });

  // Fetch user's tours
  const { data: toursData, isLoading: toursLoading } = useQuery<{ tours: Tour[] }>({
    queryKey: ['/api/tours/my-tours'],
    enabled: isAuthenticated
  });

  // Cancel tour mutation
  const cancelTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      return await apiRequest('POST', `/api/tours/${tourId}/cancel`, {
        reason: cancelReason
      });
    },
    onSuccess: () => {
      toast({
        title: "Tour Cancelled",
        description: "Your tour has been cancelled successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours/my-tours'] });
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedTour(null);
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel tour",
        variant: "destructive"
      });
    }
  });

  // Reschedule tour mutation
  const rescheduleTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      return await apiRequest('POST', `/api/tours/${tourId}/reschedule`, {
        newDate: rescheduleDate,
        newTime: rescheduleTime
      });
    },
    onSuccess: () => {
      toast({
        title: "Tour Rescheduled",
        description: "Your tour has been rescheduled successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours/my-tours'] });
      setShowRescheduleDialog(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setSelectedTour(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rescheduling Failed",
        description: error.message || "Failed to reschedule tour",
        variant: "destructive"
      });
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (tourId: number) => {
      return await apiRequest('POST', `/api/tours/${tourId}/feedback`, feedback);
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours/my-tours'] });
      setShowFeedbackDialog(false);
      setFeedback({
        overallImpression: '',
        tourNotes: '',
        pricingInfo: '',
        overallRating: 5,
        wouldRecommend: true,
        likelihood: 'likely'
      });
      setSelectedTour(null);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', variant: 'secondary' as const, icon: Calendar },
      confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'Completed', variant: 'outline' as const, icon: CalendarCheck },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: CalendarX },
      rescheduled: { label: 'Rescheduled', variant: 'secondary' as const, icon: Calendar },
      no_show: { label: 'No Show', variant: 'destructive' as const, icon: UserCheck }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTourTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return '💻';
      case 'group': return '👥';
      case 'private': return '👤';
      default: return '🏢';
    }
  };

  const getDateLabel = (date: string) => {
    const tourDate = new Date(date);
    if (isToday(tourDate)) return 'Today';
    if (isTomorrow(tourDate)) return 'Tomorrow';
    if (isPast(tourDate)) return 'Past';
    return format(tourDate, 'MMM d');
  };

  const getDateColor = (date: string) => {
    const tourDate = new Date(date);
    if (isToday(tourDate)) return 'text-green-600 dark:text-green-400';
    if (isTomorrow(tourDate)) return 'text-blue-600 dark:text-blue-400';
    if (isPast(tourDate)) return 'text-gray-500';
    return 'text-gray-700 dark:text-gray-300';
  };

  if (authLoading || toursLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to view and manage your scheduled tours.
            </p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tours = toursData?.tours || [];
  const upcomingTours = tours.filter(t => 
    isFuture(new Date(t.tourDate)) && t.status !== 'cancelled'
  );
  const pastTours = tours.filter(t => 
    isPast(new Date(t.tourDate)) || t.status === 'completed'
  );
  const cancelledTours = tours.filter(t => t.status === 'cancelled');

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Tours</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your scheduled community tours and track your visits
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingTours.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold">{pastTours.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
                <p className="text-2xl font-bold">
                  {tours.filter(t => t.feedbackSubmitted).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Communities</p>
                <p className="text-2xl font-bold">
                  {new Set(tours.map(t => t.communityId)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tours Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTours.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastTours.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledTours.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Tours</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have any tours scheduled yet.
                </p>
                <Button asChild>
                  <Link href="/search">Browse Communities</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingTours.map(tour => (
              <Card key={tour.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Section */}
                    <div className={`p-4 border-b md:border-b-0 md:border-r ${getDateColor(tour.tourDate)} bg-gray-50 dark:bg-gray-800 min-w-[120px]`}>
                      <div className="text-center">
                        <p className="text-sm font-medium opacity-75">
                          {getDateLabel(tour.tourDate)}
                        </p>
                        <p className="text-2xl font-bold">
                          {format(new Date(tour.tourDate), 'd')}
                        </p>
                        <p className="text-sm">
                          {format(new Date(tour.tourDate), 'MMM')}
                        </p>
                        <p className="text-xs mt-1">
                          {format(new Date(tour.tourDate), 'h:mm a')}
                        </p>
                      </div>
                    </div>

                    {/* Tour Details */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {tour.community.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {tour.community.city}, {tour.community.state}
                            </span>
                            {tour.community.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {tour.community.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(tour.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="flex items-center gap-1">
                          {getTourTypeIcon(tour.tourType)} {tour.tourType.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {tour.attendeeCount} {tour.attendeeCount === 1 ? 'person' : 'people'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {tour.contactPreference}
                        </span>
                      </div>

                      {tour.specialRequests && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm mb-3">
                          <span className="font-medium">Special Requests:</span> {tour.specialRequests}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTour(tour);
                            setShowRescheduleDialog(true);
                          }}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTour(tour);
                            setShowCancelDialog(true);
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/communities/${tour.communityId}`}>
                            View Community
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Tours</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't completed any tours yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            pastTours.map(tour => (
              <Card key={tour.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {tour.community.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Visited on {format(new Date(tour.tourDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    {getStatusBadge(tour.status)}
                  </div>

                  <div className="flex gap-2">
                    {!tour.feedbackSubmitted && tour.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTour(tour);
                          setShowFeedbackDialog(true);
                        }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Leave Feedback
                      </Button>
                    )}
                    {tour.feedbackSubmitted && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        Feedback Submitted
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/communities/${tour.communityId}`}>
                        View Community
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cancelled Tours</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't cancelled any tours.
                </p>
              </CardContent>
            </Card>
          ) : (
            cancelledTours.map(tour => (
              <Card key={tour.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 line-through">
                        {tour.community.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Was scheduled for {format(new Date(tour.tourDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    {getStatusBadge(tour.status)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Tour</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your tour at {selectedTour?.community.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Reason for cancellation (optional)</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Tour
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedTour && cancelTourMutation.mutate(selectedTour.id)}
              disabled={cancelTourMutation.isPending}
            >
              {cancelTourMutation.isPending ? 'Cancelling...' : 'Cancel Tour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Tour</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your tour at {selectedTour?.community.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-date">New Date</Label>
              <Input
                id="new-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="new-time">New Time</Label>
              <Input
                id="new-time"
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTour && rescheduleTourMutation.mutate(selectedTour.id)}
              disabled={!rescheduleDate || !rescheduleTime || rescheduleTourMutation.isPending}
            >
              {rescheduleTourMutation.isPending ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tour Feedback</DialogTitle>
            <DialogDescription>
              Share your experience at {selectedTour?.community.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="overall-impression">Overall Impression</Label>
              <Textarea
                id="overall-impression"
                value={feedback.overallImpression}
                onChange={(e) => setFeedback({...feedback, overallImpression: e.target.value})}
                placeholder="How was your overall experience?"
              />
            </div>
            <div>
              <Label htmlFor="tour-notes">Tour Notes</Label>
              <Textarea
                id="tour-notes"
                value={feedback.tourNotes}
                onChange={(e) => setFeedback({...feedback, tourNotes: e.target.value})}
                placeholder="Any specific observations or notes?"
              />
            </div>
            <div>
              <Label htmlFor="pricing-info">Pricing Information</Label>
              <Textarea
                id="pricing-info"
                value={feedback.pricingInfo}
                onChange={(e) => setFeedback({...feedback, pricingInfo: e.target.value})}
                placeholder="What pricing information did you receive?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Overall Rating</Label>
                <Select
                  value={feedback.overallRating.toString()}
                  onValueChange={(value) => setFeedback({...feedback, overallRating: parseInt(value)})}
                >
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="1">1 - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="likelihood">How likely to move in?</Label>
                <Select
                  value={feedback.likelihood}
                  onValueChange={(value) => setFeedback({...feedback, likelihood: value})}
                >
                  <SelectTrigger id="likelihood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_likely">Very Likely</SelectItem>
                    <SelectItem value="likely">Likely</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="unlikely">Unlikely</SelectItem>
                    <SelectItem value="very_unlikely">Very Unlikely</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="would-recommend"
                checked={feedback.wouldRecommend}
                onChange={(e) => setFeedback({...feedback, wouldRecommend: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="would-recommend">I would recommend this community to others</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTour && submitFeedbackMutation.mutate(selectedTour.id)}
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}