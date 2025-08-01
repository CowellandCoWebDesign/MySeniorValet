import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Camera, Star, Users, Clock, Smartphone, CheckCircle, AlertCircle, Calendar, Search, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { NavigationHeader } from "@/components/NavigationHeader";
import { TourScheduler } from "@/components/TourScheduler";

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  imageUrl?: string;
}

interface TourReview {
  id: number;
  communityId: number;
  community?: Community;
  tourType: string;
  visitDate: string;
  duration?: number;
  cleanliness?: { rating: number; notes: string; photos: string[] };
  staff?: { rating: number; notes: string; staffMembersMet: string[] };
  food?: { rating: number; notes: string; mealsExperienced: string[]; photos: string[] };
  amenities?: { rating: number; notes: string; amenitiesUsed: string[]; photos: string[] };
  safety?: { rating: number; notes: string; safetyFeatures: string[] };
  overall?: { rating: number; notes: string; wouldRecommend: boolean; highlights: string[]; concerns: string[] };
  familyMembers?: Array<{ name: string; relationship: string; present: boolean }>;
  familyNotes?: string;
  isPublic: boolean;
  photos: Array<{ url: string; caption: string; category: string; timestamp: string }>;
  gpsLocation?: { latitude: number; longitude: number; accuracy: number; timestamp: string };
  createdAt: string;
}

const StarRating = ({ rating, onRatingChange, disabled = false }: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer transition-colors ${
            star <= rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300 hover:text-yellow-300"
          } ${disabled ? "cursor-default" : ""}`}
          onClick={() => !disabled && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

const PhotoUpload = ({ 
  photos, 
  onPhotoAdd, 
  category 
}: { 
  photos: Array<{ url: string; caption: string; category: string; timestamp: string }>; 
  onPhotoAdd: (file: File, caption: string, category: string) => void;
  category: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoAdd(file, caption, category);
      setCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const categoryPhotos = photos.filter(p => p.category === category);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Photo caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>
      
      {categoryPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {categoryPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img 
                src={photo.url} 
                alt={photo.caption || `${category} photo`}
                className="w-full h-24 object-cover rounded-lg"
              />
              {photo.caption && (
                <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TourTracker() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showCommunitySearch, setShowCommunitySearch] = useState(false);
  const [communitySearchQuery, setCommunitySearchQuery] = useState("");
  const [showRedirectWarning, setShowRedirectWarning] = useState(false);
  const [pendingCommunityId, setPendingCommunityId] = useState<number | null>(null);
  const [tourForm, setTourForm] = useState({
    tourType: "",
    visitDate: "",
    duration: "",
    cleanliness: { rating: 0, notes: "", photos: [] },
    staff: { rating: 0, notes: "", staffMembersMet: [] },
    food: { rating: 0, notes: "", mealsExperienced: [], photos: [] },
    amenities: { rating: 0, notes: "", amenitiesUsed: [], photos: [] },
    safety: { rating: 0, notes: "", safetyFeatures: [] },
    overall: { rating: 0, notes: "", wouldRecommend: false, highlights: [], concerns: [] },
    familyMembers: [],
    familyNotes: "",
    isPublic: false,
  });
  const [photos, setPhotos] = useState<Array<{ url: string; caption: string; category: string; timestamp: string }>>([]);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  
  // Get communityId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const communityIdFromUrl = urlParams.get('communityId');

  // Fetch user communities (favorites/recently viewed)
  const { data: communities = [] } = useQuery({
    queryKey: ['/api/user/tour-communities'],
    enabled: isAuthenticated,
  });

  // Search communities
  const { data: searchResults } = useQuery({
    queryKey: ['/api/communities/search', communitySearchQuery],
    enabled: communitySearchQuery.length >= 2,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/communities/search?q=${encodeURIComponent(communitySearchQuery)}`);
      return response;
    },
  });

  // Fetch existing tour reviews (only for authenticated users)
  const { data: tourReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/tour-reviews'],
    enabled: isAuthenticated,
  });

  // Load anonymous tour data from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const savedTourData = localStorage.getItem('myseniorvalet_tour_draft');
      if (savedTourData) {
        try {
          const data = JSON.parse(savedTourData);
          setTourForm(data.tourForm || tourForm);
          setPhotos(data.photos || []);
          setSelectedCommunity(data.selectedCommunity || null);
        } catch (error) {
          console.error('Error loading saved tour data:', error);
        }
      }
    }
  }, []);

  // Fetch specific community if communityId is in URL
  const { data: communityFromUrl } = useQuery({
    queryKey: [`/api/communities/${communityIdFromUrl}`],
    enabled: !!communityIdFromUrl,
  });

  // Set selected community when URL community is loaded
  useEffect(() => {
    if (communityFromUrl && !selectedCommunity) {
      setSelectedCommunity(communityFromUrl);
    }
  }, [communityFromUrl]);

  const createTourReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return await apiRequest('POST', '/api/tour-reviews', reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Tour Review Saved!",
        description: "Your tour experience has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tour-reviews'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error Saving Review",
        description: "There was an issue saving your tour review. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.warn("GPS location not available:", error);
        }
      );
    }
  }, []);

  const resetForm = () => {
    setTourForm({
      tourType: "",
      visitDate: "",
      duration: "",
      cleanliness: { rating: 0, notes: "", photos: [] },
      staff: { rating: 0, notes: "", staffMembersMet: [] },
      food: { rating: 0, notes: "", mealsExperienced: [], photos: [] },
      amenities: { rating: 0, notes: "", amenitiesUsed: [], photos: [] },
      safety: { rating: 0, notes: "", safetyFeatures: [] },
      overall: { rating: 0, notes: "", wouldRecommend: false, highlights: [], concerns: [] },
      familyMembers: [],
      familyNotes: "",
      isPublic: false,
    });
    setPhotos([]);
    setSelectedCommunity(null);
  };

  const handlePhotoAdd = (file: File, caption: string, category: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto = {
        url: e.target?.result as string,
        caption,
        category,
        timestamp: new Date().toISOString(),
      };
      setPhotos(prev => [...prev, newPhoto]);
    };
    reader.readAsDataURL(file);
  };

  const updateRating = (category: string, rating: number) => {
    setTourForm(prev => ({
      ...prev,
      [category]: { ...prev[category], rating }
    }));
  };

  const updateNotes = (category: string, notes: string) => {
    setTourForm(prev => ({
      ...prev,
      [category]: { ...prev[category], notes }
    }));
  };

  // Save tour data to localStorage for anonymous users
  const saveDraftToLocalStorage = () => {
    const draftData = {
      tourForm,
      photos,
      selectedCommunity,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('myseniorvalet_tour_draft', JSON.stringify(draftData));
  };

  // Auto-save for anonymous users
  useEffect(() => {
    if (!isAuthenticated && (selectedCommunity || tourForm.visitDate || photos.length > 0)) {
      const saveTimer = setTimeout(() => {
        saveDraftToLocalStorage();
        toast({
          title: "Draft Saved",
          description: "Your tour progress has been saved locally.",
        });
      }, 5000); // Auto-save after 5 seconds of changes
      
      return () => clearTimeout(saveTimer);
    }
  }, [tourForm, photos, selectedCommunity, isAuthenticated]);

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<'save' | 'share' | 'upload'>('save');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) {
      toast({
        title: "Select Community",
        description: "Please select a community for your tour review.",
        variant: "destructive",
      });
      return;
    }

    // If not authenticated, prompt to login
    if (!isAuthenticated) {
      setLoginPromptAction('save');
      setShowLoginDialog(true);
      saveDraftToLocalStorage(); // Save their work before prompting
      return;
    }

    const reviewData = {
      ...tourForm,
      communityId: selectedCommunity.id,
      duration: tourForm.duration ? parseInt(tourForm.duration) : null,
      photos,
      gpsLocation: gpsLocation ? {
        ...gpsLocation,
        timestamp: new Date().toISOString(),
      } : null,
    };

    createTourReviewMutation.mutate(reviewData);
  };

  // Share tour functionality
  const handleShare = () => {
    if (!isAuthenticated) {
      setLoginPromptAction('share');
      setShowLoginDialog(true);
      saveDraftToLocalStorage();
      return;
    }
    
    // Share functionality for authenticated users
    toast({
      title: "Share Tour",
      description: "Share functionality coming soon!",
    });
  };

  // Upload review functionality  
  const handleUploadReview = () => {
    if (!isAuthenticated) {
      setLoginPromptAction('upload');
      setShowLoginDialog(true);
      saveDraftToLocalStorage();
      return;
    }
    
    // Set form to public for review upload
    setTourForm(prev => ({ ...prev, isPublic: true }));
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Login Prompt Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {loginPromptAction === 'save' && 'Save Your Tour Progress'}
              {loginPromptAction === 'share' && 'Share with Family Members'}
              {loginPromptAction === 'upload' && 'Upload Your Review'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-gray-600">
              {loginPromptAction === 'save' && 
                'Sign in to save your tour reviews and access them anytime from any device.'}
              {loginPromptAction === 'share' && 
                'Sign in to share your tour experiences with family members and collaborate on the decision.'}
              {loginPromptAction === 'upload' && 
                'Sign in to upload your review and help other families in their senior living search.'}
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-900 mb-1">Your progress is safe!</p>
              <p className="text-blue-700">
                We've saved your tour data locally. Sign in to sync it to your account.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="flex-1"
            >
              Continue Anonymously
            </Button>
            <Link href="/login" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <NavigationHeader 
        title="Tour Tracker" 
        subtitle="Document your community visits and share experiences"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

        {/* Show TourScheduler if navigated from a community detail page */}
        {communityFromUrl && selectedCommunity && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                {selectedCommunity.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCommunity.address}, {selectedCommunity.city}, {selectedCommunity.state}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <TourScheduler
                  communityId={selectedCommunity.id}
                  communityName={selectedCommunity.name}
                  communityAddress={`${selectedCommunity.city}, ${selectedCommunity.state}`}
                  buttonText="Schedule Tour"
                  buttonVariant="default"
                  onSuccess={() => {
                    toast({
                      title: "Tour Scheduled Successfully!",
                      description: "Check your email for confirmation details.",
                    });
                  }}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  Ready to visit? Schedule your tour now or continue below to document your visit experience.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="new-review" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-review">New Tour Review</TabsTrigger>
            <TabsTrigger value="my-reviews">My Reviews ({tourReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new-review">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Document Your Visit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Community Selection */}
                  <div className="space-y-2">
                    <Label>Community Visited *</Label>
                    <div className="flex gap-2">
                      {selectedCommunity ? (
                        <div className="flex-1 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedCommunity.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {selectedCommunity.city}, {selectedCommunity.state}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCommunitySearch(true)}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowCommunitySearch(true)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Select a community...
                        </Button>
                      )}
                    </div>
                    {!selectedCommunity && (
                      <p className="text-xs text-red-500">Please select a community to continue</p>
                    )}
                  </div>

                  {/* Visit Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tour Type</Label>
                      <Select onValueChange={(value) => setTourForm(prev => ({ ...prev, tourType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tour type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_person">In-Person Tour</SelectItem>
                          <SelectItem value="virtual">Virtual Tour</SelectItem>
                          <SelectItem value="self_guided">Self-Guided Visit</SelectItem>
                          <SelectItem value="family_visit">Family Visit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Visit Date</Label>
                      <Input
                        type="datetime-local"
                        value={tourForm.visitDate}
                        onChange={(e) => setTourForm(prev => ({ ...prev, visitDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        placeholder="60"
                        value={tourForm.duration}
                        onChange={(e) => setTourForm(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                  </div>

                  {gpsLocation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Location Verified</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        GPS coordinates captured for visit verification
                      </p>
                    </div>
                  )}

                  {/* Evaluation Categories */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Rate Your Experience</h3>

                    {/* Cleanliness */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cleanliness & Maintenance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Overall Rating</Label>
                          <StarRating 
                            rating={tourForm.cleanliness.rating} 
                            onRatingChange={(rating) => updateRating('cleanliness', rating)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Notes</Label>
                          <Textarea
                            placeholder="Share your observations about cleanliness, upkeep, odors, etc."
                            value={tourForm.cleanliness.notes}
                            onChange={(e) => updateNotes('cleanliness', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <PhotoUpload 
                          photos={photos}
                          onPhotoAdd={handlePhotoAdd}
                          category="cleanliness"
                        />
                      </CardContent>
                    </Card>

                    {/* Staff */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Staff Interaction</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Overall Rating</Label>
                          <StarRating 
                            rating={tourForm.staff.rating} 
                            onRatingChange={(rating) => updateRating('staff', rating)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Notes</Label>
                          <Textarea
                            placeholder="How were the staff members? Friendly, knowledgeable, attentive?"
                            value={tourForm.staff.notes}
                            onChange={(e) => updateNotes('staff', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Food */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Food & Dining</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Overall Rating</Label>
                          <StarRating 
                            rating={tourForm.food.rating} 
                            onRatingChange={(rating) => updateRating('food', rating)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Notes</Label>
                          <Textarea
                            placeholder="Food quality, variety, dining atmosphere, meal times..."
                            value={tourForm.food.notes}
                            onChange={(e) => updateNotes('food', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <PhotoUpload 
                          photos={photos}
                          onPhotoAdd={handlePhotoAdd}
                          category="food"
                        />
                      </CardContent>
                    </Card>

                    {/* Amenities */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Amenities & Activities</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Overall Rating</Label>
                          <StarRating 
                            rating={tourForm.amenities.rating} 
                            onRatingChange={(rating) => updateRating('amenities', rating)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Notes</Label>
                          <Textarea
                            placeholder="Fitness center, activities room, library, outdoor spaces, programs..."
                            value={tourForm.amenities.notes}
                            onChange={(e) => updateNotes('amenities', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <PhotoUpload 
                          photos={photos}
                          onPhotoAdd={handlePhotoAdd}
                          category="amenities"
                        />
                      </CardContent>
                    </Card>

                    {/* Safety */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Safety & Security</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Overall Rating</Label>
                          <StarRating 
                            rating={tourForm.safety.rating} 
                            onRatingChange={(rating) => updateRating('safety', rating)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Notes</Label>
                          <Textarea
                            placeholder="Emergency systems, security, accessibility, grab bars, lighting..."
                            value={tourForm.safety.notes}
                            onChange={(e) => updateNotes('safety', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Overall Impression */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Overall Impression</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Overall Rating</Label>
                          <StarRating 
                            rating={tourForm.overall.rating} 
                            onRatingChange={(rating) => updateRating('overall', rating)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="recommend"
                            checked={tourForm.overall.wouldRecommend}
                            onChange={(e) => setTourForm(prev => ({
                              ...prev,
                              overall: { ...prev.overall, wouldRecommend: e.target.checked }
                            }))}
                            className="rounded"
                          />
                          <Label htmlFor="recommend" className="text-sm">
                            I would recommend this community to others
                          </Label>
                        </div>
                        <div>
                          <Label className="text-sm">Final Notes</Label>
                          <Textarea
                            placeholder="Your overall impression, any standout features, concerns, or final thoughts..."
                            value={tourForm.overall.notes}
                            onChange={(e) => updateNotes('overall', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Family Notes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Family Collaboration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm">Family Notes</Label>
                          <Textarea
                            placeholder="Share thoughts for family members, questions to follow up on, or coordination notes..."
                            value={tourForm.familyNotes}
                            onChange={(e) => setTourForm(prev => ({ ...prev, familyNotes: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="public"
                            checked={tourForm.isPublic}
                            onChange={(e) => setTourForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                            className="rounded"
                          />
                          <Label htmlFor="public" className="text-sm">
                            Make this review public to help other families (optional)
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={handleShare}>
                        <Users className="h-4 w-4 mr-2" />
                        Share with Family
                      </Button>
                      <Button type="button" variant="outline" onClick={handleUploadReview}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Upload as Review
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Reset Form
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createTourReviewMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createTourReviewMutation.isPending ? "Saving..." : isAuthenticated ? "Save Tour Review" : "Save Tour"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-reviews">
            <div className="space-y-4">
              {!isAuthenticated ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">Sign In to View Your Reviews</h3>
                    <p className="text-gray-600 mb-4">
                      Create an account to save and access your tour reviews from any device.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Your current tour progress is saved locally and will sync when you sign in.
                    </p>
                    <Link href="/login">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Sign In to View Reviews
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : reviewsLoading ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p>Loading your tour reviews...</p>
                  </CardContent>
                </Card>
              ) : tourReviews.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No Tour Reviews Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start documenting your community visits to build a comprehensive comparison.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                tourReviews.map((review: TourReview) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {review.community?.name || `Community #${review.communityId}`}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(review.visitDate).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{review.tourType.replace('_', ' ')}</Badge>
                            {review.isPublic && <Badge className="bg-green-100 text-green-800">Public</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating rating={review.overall?.rating || 0} disabled />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <div className="font-medium">Cleanliness</div>
                          <StarRating rating={review.cleanliness?.rating || 0} disabled />
                        </div>
                        <div className="text-center">
                          <div className="font-medium">Staff</div>
                          <StarRating rating={review.staff?.rating || 0} disabled />
                        </div>
                        <div className="text-center">
                          <div className="font-medium">Food</div>
                          <StarRating rating={review.food?.rating || 0} disabled />
                        </div>
                        <div className="text-center">
                          <div className="font-medium">Amenities</div>
                          <StarRating rating={review.amenities?.rating || 0} disabled />
                        </div>
                        <div className="text-center">
                          <div className="font-medium">Safety</div>
                          <StarRating rating={review.safety?.rating || 0} disabled />
                        </div>
                      </div>
                      
                      {review.overall?.notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm">{review.overall.notes}</p>
                        </div>
                      )}
                      
                      {review.photos && review.photos.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Photos ({review.photos.length})</p>
                          <div className="grid grid-cols-4 gap-2">
                            {review.photos.slice(0, 4).map((photo, index) => (
                              <img 
                                key={index}
                                src={photo.url} 
                                alt={photo.caption || "Tour photo"}
                                className="w-full h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Community Search Dialog */}
      <Dialog open={showCommunitySearch} onOpenChange={setShowCommunitySearch}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Community</DialogTitle>
            <DialogDescription>
              Search for a community to track your tour experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, city, or address..."
                value={communitySearchQuery}
                onChange={(e) => setCommunitySearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-lg"
              />
            </div>

            {communitySearchQuery.length >= 2 && searchResults?.communities && (
              <div className="space-y-2">
                {searchResults.communities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No communities found matching your search.</p>
                ) : (
                  searchResults.communities.map((community: Community) => (
                    <Button
                      key={community.id}
                      variant="ghost"
                      className="w-full justify-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => {
                        if (communityIdFromUrl && community.id !== parseInt(communityIdFromUrl)) {
                          setPendingCommunityId(community.id);
                          setShowRedirectWarning(true);
                        } else {
                          setSelectedCommunity(community);
                          setShowCommunitySearch(false);
                        }
                      }}
                    >
                      <Building2 className="h-5 w-5 mr-3 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium">{community.name}</p>
                        <p className="text-sm text-gray-600">
                          {community.city}, {community.state} • {community.address}
                        </p>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            )}

            {!communitySearchQuery && communities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Recently Viewed Communities</p>
                {communities.map((community: Community) => (
                  <Button
                    key={community.id}
                    variant="ghost"
                    className="w-full justify-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => {
                      if (communityIdFromUrl && community.id !== parseInt(communityIdFromUrl)) {
                        setPendingCommunityId(community.id);
                        setShowRedirectWarning(true);
                      } else {
                        setSelectedCommunity(community);
                        setShowCommunitySearch(false);
                      }
                    }}
                  >
                    <Building2 className="h-5 w-5 mr-3 text-gray-400" />
                    <div className="text-left">
                      <p className="font-medium">{community.name}</p>
                      <p className="text-sm text-gray-600">
                        {community.city}, {community.state}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Redirect Warning Dialog */}
      <Dialog open={showRedirectWarning} onOpenChange={setShowRedirectWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Community?</DialogTitle>
            <DialogDescription>
              You'll be redirected to the selected community's detail page where you can start a new tour tracker.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 inline-block mr-2" />
                Any unsaved tour data for the current community will be lost.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              You can track tours for different communities by visiting their detail pages and clicking the "Start Comprehensive Tour Grading" button.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRedirectWarning(false);
                setPendingCommunityId(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingCommunityId) {
                  window.location.href = `/community/${pendingCommunityId}`;
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Continue to Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}