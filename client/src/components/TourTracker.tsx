import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Navigation,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Play,
  Pause,
  StopCircle,
  Timer,
  Award,
  TrendingUp,
  Users,
  CalendarPlus,
  PhoneCall
} from "lucide-react";

interface Tour {
  id: string;
  communityId: number;
  communityName: string;
  communityAddress: string;
  tourDate: string;
  tourTime: string;
  tourType: 'in-person' | 'virtual' | 'self-guided';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  guideContact?: {
    name: string;
    phone: string;
    email: string;
  };
  notes?: string;
  rating?: number;
  review?: string;
  photos?: string[];
  trackedData?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    checkpoints?: string[];
  };
}

interface TourTrackerProps {
  userId?: string;
}

export function TourTracker({ userId }: TourTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'upcoming' | 'tracking' | 'history' | 'reviews'>('upcoming');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTimer, setTrackingTimer] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);

  // Fetch user's tours
  const { data: tours = [], isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/user/tours', userId],
    enabled: !!userId,
  });

  // Real-time tour tracking timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && selectedTour) {
      interval = setInterval(() => {
        setTrackingTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, selectedTour]);

  // Start tour tracking
  const startTracking = (tour: Tour) => {
    setSelectedTour(tour);
    setIsTracking(true);
    setTrackingTimer(0);
    setShowTrackingDialog(true);
    
    // Update tour status to in-progress
    updateTourStatus(tour.id, 'in-progress');
    
    toast({
      title: "Tour Tracking Started",
      description: "TourTracker™ is now recording your tour experience.",
    });
  };

  // Stop tour tracking
  const stopTracking = () => {
    if (selectedTour) {
      const duration = trackingTimer;
      
      // Save tracking data
      saveTourTracking({
        tourId: selectedTour.id,
        duration,
        endTime: new Date().toISOString()
      });
      
      setIsTracking(false);
      setShowTrackingDialog(false);
      
      // Prompt for review
      setTimeout(() => {
        setShowReviewDialog(true);
      }, 500);
      
      toast({
        title: "Tour Completed",
        description: "Great job! Please share your experience.",
      });
    }
  };

  // Save tour tracking data
  const saveTourTracking = async (data: any) => {
    try {
      await apiRequest('POST', `/api/tours/${data.tourId}/tracking`, data);
      queryClient.invalidateQueries({ queryKey: ['/api/user/tours'] });
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  };

  // Update tour status
  const updateTourStatus = async (tourId: string, status: string) => {
    try {
      await apiRequest('PATCH', `/api/tours/${tourId}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tours'] });
    } catch (error) {
      console.error('Error updating tour status:', error);
    }
  };

  // Submit review
  const submitReview = async () => {
    if (!selectedTour) return;
    
    try {
      await apiRequest('POST', `/api/tours/${selectedTour.id}/review`, {
        rating,
        review: reviewText,
        photos: reviewPhotos
      });
      
      // Also submit to community reviews
      await apiRequest('POST', `/api/communities/${selectedTour.communityId}/reviews`, {
        rating,
        reviewText,
        tourId: selectedTour.id,
        verified: true // Verified because they actually toured
      });
      
      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!",
        className: "bg-green-600 text-white",
      });
      
      setShowReviewDialog(false);
      setRating(5);
      setReviewText("");
      setReviewPhotos([]);
      queryClient.invalidateQueries({ queryKey: ['/api/user/tours'] });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format time from seconds
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get tour statistics
  const tourStats = {
    total: tours.length,
    upcoming: tours.filter((t: Tour) => t.status === 'scheduled' || t.status === 'confirmed').length,
    completed: tours.filter((t: Tour) => t.status === 'completed').length,
    reviewed: tours.filter((t: Tour) => t.review).length
  };

  return (
    <div className="space-y-6">
      {/* TourTracker™ Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-6 w-6" />
            TourTracker™ - Your Tour Management Hub
          </CardTitle>
          <p className="text-white/90 mt-2">
            Track tours in real-time, manage appointments, and share your experiences
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-3xl font-bold">{tourStats.total}</div>
              <div className="text-sm text-white/80">Total Tours</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-3xl font-bold">{tourStats.upcoming}</div>
              <div className="text-sm text-white/80">Upcoming</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-3xl font-bold">{tourStats.completed}</div>
              <div className="text-sm text-white/80">Completed</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-3xl font-bold">{tourStats.reviewed}</div>
              <div className="text-sm text-white/80">Reviewed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Sections */}
      <Tabs value={activeSection} onValueChange={(v: any) => setActiveSection(v)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Track Tour
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tours */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Scheduled Tours</CardTitle>
            </CardHeader>
            <CardContent>
              {tours.filter((t: Tour) => ['scheduled', 'confirmed'].includes(t.status)).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming tours scheduled</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/search'}>
                    Browse Communities
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.filter((t: Tour) => ['scheduled', 'confirmed'].includes(t.status)).map((tour: Tour) => (
                    <Card key={tour.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{tour.communityName}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {tour.communityAddress}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant={tour.status === 'confirmed' ? 'default' : 'secondary'}>
                                {tour.status}
                              </Badge>
                              <span className="text-sm flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(tour.tourDate).toLocaleDateString()}
                              </span>
                              <span className="text-sm flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tour.tourTime}
                              </span>
                            </div>
                            {tour.guideContact && (
                              <div className="mt-3 p-2 bg-gray-50 rounded">
                                <p className="text-sm">Tour Guide: {tour.guideContact.name}</p>
                                <p className="text-sm text-gray-600">{tour.guideContact.phone}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => startTracking(tour)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Start Tour
                            </Button>
                            <Button size="sm" variant="outline">
                              <PhoneCall className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Track Tour */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Tour Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {!isTracking ? (
                <div className="text-center py-8">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Select a tour to start tracking</p>
                  <p className="text-sm text-gray-400">
                    TourTracker™ helps you record your tour experience in real-time
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-green-800">Tracking Active</h4>
                      <Badge className="bg-green-600">LIVE</Badge>
                    </div>
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-green-600 font-mono">
                        {formatTime(trackingTimer)}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Tour Duration</p>
                    </div>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700" 
                      onClick={stopTracking}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Tour
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tour History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tour History</CardTitle>
            </CardHeader>
            <CardContent>
              {tours.filter((t: Tour) => t.status === 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No completed tours yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.filter((t: Tour) => t.status === 'completed').map((tour: Tour) => (
                    <Card key={tour.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{tour.communityName}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Toured on {new Date(tour.tourDate).toLocaleDateString()}
                            </p>
                            {tour.trackedData?.duration && (
                              <p className="text-sm text-gray-500 mt-1">
                                Duration: {Math.round(tour.trackedData.duration / 60)} minutes
                              </p>
                            )}
                            {tour.rating && (
                              <div className="flex items-center gap-1 mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < tour.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {!tour.review && (
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedTour(tour);
                                  setShowReviewDialog(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Write Review
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {tours.filter((t: Tour) => t.review).length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews written yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Share your tour experiences to help other families
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.filter((t: Tour) => t.review).map((tour: Tour) => (
                    <Card key={tour.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">{tour.communityName}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < tour.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{tour.review}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(tour.tourDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Your Tour Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">How was your tour at {selectedTour?.communityName}?</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`h-8 w-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} hover:text-yellow-400 transition-colors`} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-lg font-semibold">{rating}/5</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share details about your tour experience..."
                rows={6}
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Earn Review Rewards
              </h4>
              <p className="text-sm text-gray-600">
                Your verified tour review helps other families make informed decisions. 
                Thank you for contributing to our community!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview} className="bg-green-600 hover:bg-green-700">
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tour in Progress</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-green-600 font-mono mb-4">
              {formatTime(trackingTimer)}
            </div>
            <p className="text-gray-600 mb-6">
              Tracking your tour at {selectedTour?.communityName}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setShowTrackingDialog(false)}
              >
                Continue in Background
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700" 
                onClick={stopTracking}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Tour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}