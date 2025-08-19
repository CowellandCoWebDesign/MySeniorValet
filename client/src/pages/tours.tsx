import { useState } from "react";
import { Calendar, MapPin, Clock, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TourFeedbackModal } from "@/components/TourFeedbackModal";
import { Header } from "@/components/header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ToursPage() {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedTourForFeedback, setSelectedTourForFeedback] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's tours
  const { data: toursData, isLoading } = useQuery<{ tours: any[] }>({
    queryKey: ['/api/tours/my-tours'],
    enabled: true,
  });

  // Schedule tour mutation
  const scheduleTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      const response = await fetch('/api/tours/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule tour');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tour Scheduled!",
        description: "You'll receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours/my-tours'] });
      setScheduleDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Cancel tour mutation
  const cancelTourMutation = useMutation({
    mutationFn: async ({ tourId, reason }: { tourId: number; reason: string }) => {
      const response = await fetch(`/api/tours/${tourId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel tour');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tour Cancelled",
        description: "Your tour has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours/my-tours'] });
    },
  });

  const tours = toursData?.tours || [];
  
  const upcomingTours = tours.filter(
    (tour: any) => new Date(tour.tour.tourDate) > new Date() && tour.tour.status === 'scheduled'
  );

  const pastTours = tours.filter(
    (tour: any) => new Date(tour.tour.tourDate) <= new Date() || tour.tour.status === 'completed'
  );

  const TourCard = ({ tour }: { tour: any }) => {
    const tourDate = new Date(tour.tour.tourDate);
    const isPast = tourDate < new Date();

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{tour.community?.name || 'Community Name'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {tour.community?.address}, {tour.community?.city}, {tour.community?.state}
              </CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              tour.tour.status === 'scheduled' ? 'bg-green-100 text-green-800' :
              tour.tour.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tour.tour.status}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{format(tourDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{format(tourDate, 'h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{tour.tour.attendeeCount} attendee{tour.tour.attendeeCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          {tour.tour.specialRequests && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Special Requests:</strong> {tour.tour.specialRequests}
              </p>
            </div>
          )}

          {!isPast && tour.tour.status === 'scheduled' && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this tour?')) {
                    cancelTourMutation.mutate({
                      tourId: tour.tour.id,
                      reason: 'Cancelled by user',
                    });
                  }
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel Tour
              </Button>
            </div>
          )}

          {isPast && tour.tour.status === 'completed' && !tour.tour.feedbackSubmitted && (
            <div className="mt-4">
              <Button 
                size="sm"
                onClick={() => {
                  setSelectedTourForFeedback(tour);
                  setFeedbackModalOpen(true);
                }}
              >
                Leave Feedback
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Tours</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your scheduled tours and view past visits</p>
        </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming Tours ({upcomingTours.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Tours ({pastTours.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="text-center py-8">Loading tours...</div>
          ) : upcomingTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any upcoming tours scheduled.</p>
                <Button onClick={() => window.location.href = "/map-search"}>
                  Find Communities
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              {upcomingTours.map((tour: any) => (
                <TourCard key={tour.tour.id} tour={tour} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <div className="text-center py-8">Loading tours...</div>
          ) : pastTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">You haven't completed any tours yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pastTours.map((tour: any) => (
                <TourCard key={tour.tour.id} tour={tour} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Tour Dialog (for when called from community profile) */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Tour</DialogTitle>
            <DialogDescription>
              {selectedCommunity?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            scheduleTourMutation.mutate({
              communityId: selectedCommunity?.id,
              tourDate: formData.get('tourDate'),
              tourTime: formData.get('tourTime'),
              tourType: formData.get('tourType'),
              attendeeCount: parseInt(formData.get('attendeeCount') as string),
              contactName: formData.get('contactName'),
              contactEmail: formData.get('contactEmail'),
              contactPhone: formData.get('contactPhone'),
              contactPreference: formData.get('contactPreference'),
              specialRequests: formData.get('specialRequests'),
            });
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tourDate">Date</Label>
                  <Input
                    id="tourDate"
                    name="tourDate"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="tourTime">Time</Label>
                  <Input
                    id="tourTime"
                    name="tourTime"
                    type="time"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tourType">Tour Type</Label>
                <Select name="tourType" defaultValue="in_person">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="group">Group Tour</SelectItem>
                    <SelectItem value="private">Private Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="attendeeCount">Number of Attendees</Label>
                <Input
                  id="attendeeCount"
                  name="attendeeCount"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                />
              </div>

              <div>
                <Label htmlFor="contactPreference">Preferred Contact Method</Label>
                <Select name="contactPreference" defaultValue="email">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="Any specific areas you'd like to see or questions you have..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleTourMutation.isPending}>
                {scheduleTourMutation.isPending ? 'Scheduling...' : 'Schedule Tour'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tour Feedback Modal */}
      {selectedTourForFeedback && (
        <TourFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedTourForFeedback(null);
            queryClient.invalidateQueries({ queryKey: ['/api/tours/my-tours'] });
          }}
          tourId={selectedTourForFeedback.tour.id}
          tourDetails={{
            communityName: selectedTourForFeedback.community.name,
            tourDate: selectedTourForFeedback.tour.tourDate,
            userName: selectedTourForFeedback.user?.firstName
          }}
        />
      )}
      </div>
    </div>
  );
}