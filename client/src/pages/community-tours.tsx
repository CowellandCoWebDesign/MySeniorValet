import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isFuture, isToday, isTomorrow, addDays } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle,
  X,
  AlertCircle,
  Users,
  MessageSquare,
  User,
  CalendarDays,
  FileText,
  TrendingUp
} from 'lucide-react';

interface Tour {
  tour: {
    id: number;
    tourDate: string;
    tourType: 'in_person' | 'virtual' | 'group' | 'private';
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
    attendeeCount: number;
    specialRequests?: string;
    contactPreference: 'email' | 'phone' | 'text';
    createdAt: string;
  };
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

export default function CommunityTours() {
  const params = useParams();
  const communityId = params.communityId ? parseInt(params.communityId) : 0;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Fetch community details
  const { data: community } = useQuery({
    queryKey: [`/api/communities/${communityId}`],
    enabled: communityId > 0
  });

  // Fetch community's tours
  const { data: toursData, isLoading } = useQuery<{ tours: Tour[] }>({
    queryKey: [`/api/tours/community/${communityId}`],
    enabled: communityId > 0 && isAuthenticated
  });

  // Confirm tour mutation
  const confirmTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      return await apiRequest('POST', `/api/tours/${tourId}/confirm`);
    },
    onSuccess: () => {
      toast({
        title: "Tour Confirmed",
        description: "The tour has been confirmed and the guest has been notified."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tours/community/${communityId}`] });
      setShowConfirmDialog(false);
      setSelectedTour(null);
    },
    onError: (error: any) => {
      toast({
        title: "Confirmation Failed",
        description: error.message || "Failed to confirm tour",
        variant: "destructive"
      });
    }
  });

  // Decline tour mutation
  const declineTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      return await apiRequest('POST', `/api/tours/${tourId}/decline`, {
        reason: declineReason
      });
    },
    onSuccess: () => {
      toast({
        title: "Tour Declined",
        description: "The tour request has been declined."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tours/community/${communityId}`] });
      setShowDeclineDialog(false);
      setDeclineReason('');
      setSelectedTour(null);
    },
    onError: (error: any) => {
      toast({
        title: "Decline Failed",
        description: error.message || "Failed to decline tour",
        variant: "destructive"
      });
    }
  });

  // Mark as no-show mutation
  const markNoShowMutation = useMutation({
    mutationFn: async (tourId: number) => {
      return await apiRequest('POST', `/api/tours/${tourId}/no-show`);
    },
    onSuccess: () => {
      toast({
        title: "Marked as No Show",
        description: "The tour has been marked as no show."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tours/community/${communityId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update tour status",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if user has permission to view this page
  const hasPermission = user?.role === 'admin' || 
                       user?.role === 'vendor' || 
                       user?.id === community?.claimedById;

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view this community's tours. 
            Please claim this listing or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tours = toursData?.tours || [];
  const upcomingTours = tours.filter(t => 
    isFuture(new Date(t.tour.tourDate)) && 
    ['scheduled', 'confirmed'].includes(t.tour.status)
  );
  const todayTours = tours.filter(t => 
    isToday(new Date(t.tour.tourDate)) && 
    ['scheduled', 'confirmed'].includes(t.tour.status)
  );
  const pastTours = tours.filter(t => 
    (isPast(new Date(t.tour.tourDate)) && !isToday(new Date(t.tour.tourDate))) || 
    ['completed', 'no_show'].includes(t.tour.status)
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', variant: 'secondary' as const },
      confirmed: { label: 'Confirmed', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'outline' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
      rescheduled: { label: 'Rescheduled', variant: 'secondary' as const },
      no_show: { label: 'No Show', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTourTypeLabel = (type: string) => {
    switch (type) {
      case 'virtual': return '💻 Virtual';
      case 'group': return '👥 Group';
      case 'private': return '👤 Private';
      default: return '🏢 In-Person';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tour Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {community?.name} - Manage scheduled tours and visitor appointments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold">{todayTours.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold">
                  {tours.filter(t => {
                    const tourDate = new Date(t.tour.tourDate);
                    return tourDate >= new Date() && tourDate <= addDays(new Date(), 7);
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold">
                  {tours.filter(t => t.tour.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
                <p className="text-2xl font-bold">
                  {tours.length > 0 
                    ? Math.round((tours.filter(t => t.tour.status === 'completed').length / tours.length) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tours Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">
            Today ({todayTours.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTours.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastTours.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tours Today</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any tours scheduled for today.
                </p>
              </CardContent>
            </Card>
          ) : (
            todayTours.map(tour => (
              <Card key={tour.tour.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {format(new Date(tour.tour.tourDate), 'h:mm a')} - 
                        {tour.user.firstName} {tour.user.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {tour.user.email}
                        </span>
                        {tour.user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {tour.user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(tour.tour.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span>{getTourTypeLabel(tour.tour.tourType)}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {tour.tour.attendeeCount} {tour.tour.attendeeCount === 1 ? 'person' : 'people'}
                    </span>
                    <span>Contact via {tour.tour.contactPreference}</span>
                  </div>

                  {tour.tour.specialRequests && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded text-sm mb-3">
                      <span className="font-medium">Special Requests:</span> {tour.tour.specialRequests}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {tour.tour.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTour(tour);
                            setShowConfirmDialog(true);
                          }}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTour(tour);
                            setShowDeclineDialog(true);
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    {tour.tour.status === 'confirmed' && isPast(new Date(tour.tour.tourDate)) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markNoShowMutation.mutate(tour.tour.id)}
                      >
                        Mark as No Show
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Tours</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any tours scheduled in the future.
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingTours.map(tour => (
              <Card key={tour.tour.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {format(new Date(tour.tour.tourDate), 'EEE, MMM d at h:mm a')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tour.user.firstName} {tour.user.lastName} - {tour.user.email}
                      </p>
                    </div>
                    {getStatusBadge(tour.tour.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span>{getTourTypeLabel(tour.tour.tourType)}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {tour.tour.attendeeCount} {tour.tour.attendeeCount === 1 ? 'person' : 'people'}
                    </span>
                  </div>

                  {tour.tour.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTour(tour);
                          setShowConfirmDialog(true);
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTour(tour);
                          setShowDeclineDialog(true);
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Tours</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't had any completed tours yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            pastTours.map(tour => (
              <Card key={tour.tour.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {tour.user.firstName} {tour.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(tour.tour.tourDate), 'MMMM d, yyyy at h:mm a')}
                      </p>
                    </div>
                    {getStatusBadge(tour.tour.status)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Tour</DialogTitle>
            <DialogDescription>
              Confirm the tour for {selectedTour?.user.firstName} {selectedTour?.user.lastName} on{' '}
              {selectedTour && format(new Date(selectedTour.tour.tourDate), 'MMMM d at h:mm a')}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTour && confirmTourMutation.mutate(selectedTour.tour.id)}
              disabled={confirmTourMutation.isPending}
            >
              {confirmTourMutation.isPending ? 'Confirming...' : 'Confirm Tour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Tour Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this tour request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedTour && declineTourMutation.mutate(selectedTour.tour.id)}
              disabled={!declineReason || declineTourMutation.isPending}
            >
              {declineTourMutation.isPending ? 'Declining...' : 'Decline Tour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}