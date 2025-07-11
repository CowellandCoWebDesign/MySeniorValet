import { useState } from "react";
import { useLocation, useParams, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { createTourSchema, type CreateTour, type Community } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Camera, 
  DollarSign, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Plus, 
  Minus,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  FileImage,
  Home,
  Utensils,
  Dumbbell,
  Car,
  X
} from "lucide-react";
import { format } from "date-fns";

interface TourTrackerProps {
  tourId?: string;
  communityId?: string;
}

interface PhotoUpload {
  file: File;
  url: string;
  caption?: string;
  category: "unit" | "common_area" | "amenity" | "exterior" | "dining" | "activity" | "staff" | "document" | "other";
  notes?: string;
}

const photoCategoryIcons = {
  unit: Home,
  common_area: Users,
  amenity: Dumbbell,
  exterior: MapPin,
  dining: Utensils,
  activity: Star,
  staff: Users,
  document: FileImage,
  other: Camera
};

const photoCategoryLabels = {
  unit: "Unit/Apartment",
  common_area: "Common Areas",
  amenity: "Amenities",
  exterior: "Exterior/Grounds",
  dining: "Dining Areas",
  activity: "Activities",
  staff: "Staff",
  document: "Documents",
  other: "Other"
};

export default function TourTracker({ tourId, communityId }: TourTrackerProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState("overview");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [unitsViewed, setUnitsViewed] = useState<any[]>([]);
  const [followUpActions, setFollowUpActions] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<{
    positives: string[];
    concerns: string[];
    standoutFeatures: string[];
  }>({
    positives: [],
    concerns: [],
    standoutFeatures: []
  });

  // Get route parameters
  const [, params] = useRoute("/tour-tracker/:communityId");
  const [, editParams] = useRoute("/edit-tour/:tourId");
  
  const routeCommunityId = params?.communityId || communityId;
  const routeTourId = editParams?.tourId || tourId;

  // Get community data
  const { data: community } = useQuery({
    queryKey: ["/api/communities", routeCommunityId],
    enabled: !!routeCommunityId,
  });

  // Get tour data if editing
  const { data: tour } = useQuery({
    queryKey: ["/api/tours", routeTourId],
    enabled: !!routeTourId,
  });

  const form = useForm<CreateTour>({
    resolver: zodResolver(createTourSchema),
    defaultValues: {
      userId: user?.id || 0,
      communityId: parseInt(routeCommunityId || "0"),
      tourDate: new Date(),
      tourType: "in_person",
      status: "completed",
      attendeeCount: 1,
      tourNotes: "",
      overallRating: 5,
      wouldRecommend: true,
      likelihood: 8,
      tourPhotos: [],
      unitsViewed: [],
      highlights: {
        positives: [],
        concerns: [],
        standoutFeatures: []
      },
      pricingInfo: {
        moveInCosts: {}
      },
      staffInteraction: {
        professionalism: 5,
        knowledgeLevel: 5,
        responsiveness: 5
      },
      followUpActions: []
    }
  });

  const saveTourMutation = useMutation({
    mutationFn: async (data: CreateTour) => {
      const endpoint = routeTourId ? `/api/tours/${routeTourId}` : "/api/tours";
      const method = routeTourId ? "PUT" : "POST";
      return await apiRequest(endpoint, {
        method,
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Tour saved successfully!",
        description: "Your tour information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      if (!routeTourId) {
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      toast({
        title: "Error saving tour",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: PhotoUpload = {
            file,
            url: e.target?.result as string,
            category: "other",
            caption: "",
            notes: ""
          };
          setPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addUnit = () => {
    setUnitsViewed(prev => [...prev, {
      unitType: "",
      price: 0,
      availability: "",
      impressions: "",
      condition: "good"
    }]);
  };

  const removeUnit = (index: number) => {
    setUnitsViewed(prev => prev.filter((_, i) => i !== index));
  };

  const addFollowUpAction = () => {
    setFollowUpActions(prev => [...prev, {
      action: "",
      completed: false,
      notes: ""
    }]);
  };

  const removeFollowUpAction = (index: number) => {
    setFollowUpActions(prev => prev.filter((_, i) => i !== index));
  };

  const addHighlight = (type: "positives" | "concerns" | "standoutFeatures") => {
    setHighlights(prev => ({
      ...prev,
      [type]: [...prev[type], ""]
    }));
  };

  const removeHighlight = (type: "positives" | "concerns" | "standoutFeatures", index: number) => {
    setHighlights(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const onSubmit = (data: CreateTour) => {
    // Add photos, units, and other dynamic data
    const formData = {
      ...data,
      tourPhotos: photos.map(p => ({
        url: p.url,
        caption: p.caption,
        category: p.category,
        timestamp: new Date().toISOString(),
        notes: p.notes
      })),
      unitsViewed,
      highlights,
      followUpActions
    };

    saveTourMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to use the tour tracker.
            </p>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Tour Tracker
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {routeTourId ? "Edit Tour" : "New Tour Tracker"}
              </h1>
              {community && (
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {community.name} - {community.city}, {community.state}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={saveTourMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saveTourMutation.isPending ? "Saving..." : "Save Tour"}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Tour Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tourDate">Tour Date</Label>
                        <Input
                          id="tourDate"
                          type="datetime-local"
                          {...form.register("tourDate")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tourType">Tour Type</Label>
                        <Select
                          value={form.watch("tourType")}
                          onValueChange={(value) => form.setValue("tourType", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tour type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_person">In-Person</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="group">Group Tour</SelectItem>
                            <SelectItem value="private">Private Tour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="attendeeCount">Number of Attendees</Label>
                      <Input
                        id="attendeeCount"
                        type="number"
                        min="1"
                        {...form.register("attendeeCount", { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tourNotes">Tour Notes</Label>
                      <Textarea
                        id="tourNotes"
                        rows={4}
                        placeholder="General notes about the tour..."
                        {...form.register("tourNotes")}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Overall Impression
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="overallRating">Overall Rating (1-5)</Label>
                      <Input
                        id="overallRating"
                        type="number"
                        min="1"
                        max="5"
                        {...form.register("overallRating", { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="likelihood">Likelihood to Move In (1-10)</Label>
                      <Input
                        id="likelihood"
                        type="number"
                        min="1"
                        max="10"
                        {...form.register("likelihood", { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="wouldRecommend"
                        {...form.register("wouldRecommend")}
                      />
                      <Label htmlFor="wouldRecommend">Would recommend to others</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="overallImpression">Overall Impression</Label>
                      <Select
                        value={form.watch("overallImpression")}
                        onValueChange={(value) => form.setValue("overallImpression", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select impression" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_positive">Very Positive</SelectItem>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="very_negative">Very Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Tour Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-700">
                          Click to upload photos
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Upload photos from your tour (JPG, PNG, HEIC)
                        </p>
                      </Label>
                    </div>
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative bg-white rounded-lg shadow-sm border">
                          <img
                            src={photo.url}
                            alt={photo.caption || "Tour photo"}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="p-4">
                            <div className="space-y-2">
                              <Select
                                value={photo.category}
                                onValueChange={(value) => {
                                  const newPhotos = [...photos];
                                  newPhotos[index].category = value as any;
                                  setPhotos(newPhotos);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(photoCategoryLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Input
                                placeholder="Caption..."
                                value={photo.caption || ""}
                                onChange={(e) => {
                                  const newPhotos = [...photos];
                                  newPhotos[index].caption = e.target.value;
                                  setPhotos(newPhotos);
                                }}
                              />
                              
                              <Textarea
                                placeholder="Notes about this photo..."
                                value={photo.notes || ""}
                                onChange={(e) => {
                                  const newPhotos = [...photos];
                                  newPhotos[index].notes = e.target.value;
                                  setPhotos(newPhotos);
                                }}
                                rows={2}
                              />
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Units Tab */}
            <TabsContent value="units" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Units Viewed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button
                      type="button"
                      onClick={addUnit}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Unit
                    </Button>
                  </div>

                  {unitsViewed.length > 0 && (
                    <div className="space-y-4">
                      {unitsViewed.map((unit, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold">Unit {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUnit(index)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <Label>Unit Type</Label>
                                <Input
                                  placeholder="Studio, 1BR, 2BR..."
                                  value={unit.unitType}
                                  onChange={(e) => {
                                    const newUnits = [...unitsViewed];
                                    newUnits[index].unitType = e.target.value;
                                    setUnitsViewed(newUnits);
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Price</Label>
                                <Input
                                  type="number"
                                  placeholder="Monthly price"
                                  value={unit.price}
                                  onChange={(e) => {
                                    const newUnits = [...unitsViewed];
                                    newUnits[index].price = parseFloat(e.target.value);
                                    setUnitsViewed(newUnits);
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Availability</Label>
                                <Input
                                  placeholder="Available now, 30 days..."
                                  value={unit.availability}
                                  onChange={(e) => {
                                    const newUnits = [...unitsViewed];
                                    newUnits[index].availability = e.target.value;
                                    setUnitsViewed(newUnits);
                                  }}
                                />
                              </div>
                              
                              <div>
                                <Label>Condition</Label>
                                <Select
                                  value={unit.condition}
                                  onValueChange={(value) => {
                                    const newUnits = [...unitsViewed];
                                    newUnits[index].condition = value;
                                    setUnitsViewed(newUnits);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label>Impressions</Label>
                              <Textarea
                                placeholder="Your impressions of this unit..."
                                value={unit.impressions}
                                onChange={(e) => {
                                  const newUnits = [...unitsViewed];
                                  newUnits[index].impressions = e.target.value;
                                  setUnitsViewed(newUnits);
                                }}
                                rows={3}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Quoted Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priceMin">Minimum Price</Label>
                        <Input
                          id="priceMin"
                          type="number"
                          placeholder="3000"
                          {...form.register("pricingInfo.quotedPrice.min", { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priceMax">Maximum Price</Label>
                        <Input
                          id="priceMax"
                          type="number"
                          placeholder="5000"
                          {...form.register("pricingInfo.quotedPrice.max", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="careLevel">Care Level</Label>
                      <Input
                        id="careLevel"
                        placeholder="Independent Living, Assisted Living..."
                        {...form.register("pricingInfo.quotedPrice.careLevel")}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Move-In Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="securityDeposit">Security Deposit</Label>
                        <Input
                          id="securityDeposit"
                          type="number"
                          placeholder="2000"
                          {...form.register("pricingInfo.moveInCosts.securityDeposit", { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="firstMonthRent">First Month Rent</Label>
                        <Input
                          id="firstMonthRent"
                          type="number"
                          placeholder="4000"
                          {...form.register("pricingInfo.moveInCosts.firstMonthRent", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="applicationFee">Application Fee</Label>
                        <Input
                          id="applicationFee"
                          type="number"
                          placeholder="100"
                          {...form.register("pricingInfo.moveInCosts.applicationFee", { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminFee">Admin Fee</Label>
                        <Input
                          id="adminFee"
                          type="number"
                          placeholder="250"
                          {...form.register("pricingInfo.moveInCosts.adminFee", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Rent Increases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rentFrequency">Increase Frequency</Label>
                    <Select
                      value={form.watch("pricingInfo.rentIncrease.frequency")}
                      onValueChange={(value) => form.setValue("pricingInfo.rentIncrease.frequency", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="biannual">Biannual</SelectItem>
                        <SelectItem value="as_needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="averagePercentage">Average Percentage Increase</Label>
                    <Input
                      id="averagePercentage"
                      type="number"
                      placeholder="5"
                      step="0.1"
                      {...form.register("pricingInfo.rentIncrease.averagePercentage", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nextIncrease">Next Planned Increase</Label>
                    <Input
                      id="nextIncrease"
                      type="date"
                      {...form.register("pricingInfo.rentIncrease.nextPlannedIncrease")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Staff Interaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tourGuide">Tour Guide Name</Label>
                    <Input
                      id="tourGuide"
                      placeholder="Staff member who gave the tour"
                      {...form.register("staffInteraction.tourGuide")}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="professionalism">Professionalism (1-5)</Label>
                      <Input
                        id="professionalism"
                        type="number"
                        min="1"
                        max="5"
                        {...form.register("staffInteraction.professionalism", { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="knowledgeLevel">Knowledge Level (1-5)</Label>
                      <Input
                        id="knowledgeLevel"
                        type="number"
                        min="1"
                        max="5"
                        {...form.register("staffInteraction.knowledgeLevel", { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="responsiveness">Responsiveness (1-5)</Label>
                      <Input
                        id="responsiveness"
                        type="number"
                        min="1"
                        max="5"
                        {...form.register("staffInteraction.responsiveness", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="followUpCommitment">Follow-up Commitment</Label>
                    <Textarea
                      id="followUpCommitment"
                      placeholder="What did the staff commit to following up on?"
                      {...form.register("staffInteraction.followUpCommitment")}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Positives</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addHighlight("positives")}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {highlights.positives.map((positive, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="What did you like?"
                            value={positive}
                            onChange={(e) => {
                              const newHighlights = { ...highlights };
                              newHighlights.positives[index] = e.target.value;
                              setHighlights(newHighlights);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHighlight("positives", index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Concerns</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addHighlight("concerns")}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {highlights.concerns.map((concern, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="What concerned you?"
                            value={concern}
                            onChange={(e) => {
                              const newHighlights = { ...highlights };
                              newHighlights.concerns[index] = e.target.value;
                              setHighlights(newHighlights);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHighlight("concerns", index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Standout Features</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addHighlight("standoutFeatures")}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {highlights.standoutFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="What stood out?"
                            value={feature}
                            onChange={(e) => {
                              const newHighlights = { ...highlights };
                              newHighlights.standoutFeatures[index] = e.target.value;
                              setHighlights(newHighlights);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHighlight("standoutFeatures", index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Follow-up Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Button
                        type="button"
                        onClick={addFollowUpAction}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Action
                      </Button>
                    </div>

                    {followUpActions.length > 0 && (
                      <div className="space-y-4">
                        {followUpActions.map((action, index) => (
                          <Card key={index} className="border-l-4 border-l-yellow-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Action {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFollowUpAction(index)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <Input
                                  placeholder="Action to take..."
                                  value={action.action}
                                  onChange={(e) => {
                                    const newActions = [...followUpActions];
                                    newActions[index].action = e.target.value;
                                    setFollowUpActions(newActions);
                                  }}
                                />
                                
                                <Input
                                  type="date"
                                  placeholder="Due date"
                                  value={action.dueDate}
                                  onChange={(e) => {
                                    const newActions = [...followUpActions];
                                    newActions[index].dueDate = e.target.value;
                                    setFollowUpActions(newActions);
                                  }}
                                />
                                
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={action.completed}
                                    onChange={(e) => {
                                      const newActions = [...followUpActions];
                                      newActions[index].completed = e.target.checked;
                                      setFollowUpActions(newActions);
                                    }}
                                  />
                                  <Label>Completed</Label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}