import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Upload,
  Eye,
  ExternalLink,
  Settings,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera
} from "lucide-react";

interface TourData {
  id?: number;
  matterportTourId?: string;
  matterportTourUrl?: string;
  tourProvider: string;
  tourStatus: string;
  tourPreviewImage?: string;
  tourMetadata: {
    duration?: number;
    roomCount?: number;
    totalViews?: number;
    uploadedAt?: string;
    uploadedBy?: string;
    tourDescription?: string;
    roomLabels?: string[];
    features?: string[];
  };
}

interface TourManagementProps {
  communityId: number;
  subscriptionTier: string;
}

export function TourManagement({ communityId, subscriptionTier }: TourManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Check if community has access to 3D tours (Featured tier and above)
  const hasAccess = ['featured', 'platinum'].includes(subscriptionTier);

  // Query current tour data
  const { data: tourData, isLoading, error } = useQuery({
    queryKey: [`/api/communities/${communityId}/tour`],
    enabled: hasAccess && !!communityId,
  });

  // Tour analytics query
  const { data: analytics } = useQuery({
    queryKey: [`/api/communities/${communityId}/tour/analytics`],
    enabled: hasAccess && !!communityId && tourData?.tourStatus === 'active',
  });

  // Mutation for updating tour
  const updateTourMutation = useMutation({
    mutationFn: async (data: Partial<TourData>) => {
      return await apiRequest("PUT", `/api/communities/${communityId}/tour`, data);
    },
    onSuccess: () => {
      toast({
        title: "Tour updated successfully",
        description: "Your 3D tour has been updated and will be processed shortly.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/tour`] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for uploading tour
  const uploadTourMutation = useMutation({
    mutationFn: async (tourUrl: string) => {
      return await apiRequest("POST", `/api/communities/${communityId}/tour/upload`, {
        tourUrl,
        provider: 'matterport'
      });
    },
    onSuccess: () => {
      toast({
        title: "Tour upload started",
        description: "Your 3D tour is being processed and will be available shortly.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/tour`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            3D Virtual Tours
          </CardTitle>
          <CardDescription>
            Immersive virtual tours with Matterport integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              3D Virtual Tours are available for <strong>Featured ($249/month)</strong> and <strong>Platinum ($349/month)</strong> tiers.
              <br />
              Upgrade to showcase your community with immersive virtual tours that help families explore your space remotely.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            3D Virtual Tours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasTour = tourData && (tourData.matterportTourUrl || tourData.matterportTourId);
  const tourStatus = tourData?.tourStatus || 'pending';

  return (
    <div className="space-y-6">
      {/* Main Tour Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            3D Virtual Tours
            {hasTour && (
              <Badge 
                variant={tourStatus === 'active' ? 'default' : tourStatus === 'processing' ? 'secondary' : 'destructive'}
                className="ml-2"
              >
                {tourStatus}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Upload and manage Matterport 3D tours to give families an immersive experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasTour ? (
            /* Upload New Tour */
            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Your First 3D Tour</h3>
              <p className="text-muted-foreground mb-4">
                Share your Matterport tour URL to give families an immersive virtual experience
              </p>
              <TourUploadForm 
                onSubmit={(url) => uploadTourMutation.mutate(url)}
                isLoading={uploadTourMutation.isPending}
              />
            </div>
          ) : (
            /* Existing Tour Management */
            <div className="space-y-4">
              {/* Tour Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {tourData.tourPreviewImage ? (
                      <img 
                        src={tourData.tourPreviewImage} 
                        alt="Tour preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Camera className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={tourStatus === 'active' ? 'default' : 'secondary'}>
                      {tourStatus === 'active' ? 'Live' : tourStatus}
                    </Badge>
                    {tourData.tourProvider && (
                      <Badge variant="outline">{tourData.tourProvider}</Badge>
                    )}
                  </div>
                  
                  {tourData.matterportTourUrl && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={tourData.matterportTourUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View Tour
                      </a>
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>

              {/* Tour Details */}
              {tourData.tourMetadata && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {tourData.tourMetadata.totalViews && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tourData.tourMetadata.totalViews.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </div>
                  )}
                  {tourData.tourMetadata.roomCount && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tourData.tourMetadata.roomCount}</div>
                      <div className="text-sm text-muted-foreground">Rooms</div>
                    </div>
                  )}
                  {tourData.tourMetadata.duration && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tourData.tourMetadata.duration}min</div>
                      <div className="text-sm text-muted-foreground">Avg. Duration</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Live</div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              {isEditing && (
                <TourEditForm
                  initialData={tourData}
                  onSubmit={(data) => updateTourMutation.mutate(data)}
                  onCancel={() => setIsEditing(false)}
                  isLoading={updateTourMutation.isPending}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Card */}
      {hasTour && analytics && tourStatus === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Tour Analytics
            </CardTitle>
            <CardDescription>
              Performance insights for your 3D tour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.dailyViews || 0}</div>
                <div className="text-sm text-muted-foreground">Views Today</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.avgDuration || 0}min</div>
                <div className="text-sm text-muted-foreground">Avg. Duration</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.completionRate || 0}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.tourToLeads || 0}</div>
                <div className="text-sm text-muted-foreground">Tour → Leads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TourUploadForm({ onSubmit, isLoading }: { onSubmit: (url: string) => void; isLoading: boolean }) {
  const [tourUrl, setTourUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tourUrl.trim()) {
      onSubmit(tourUrl.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="text-left">
        <Label htmlFor="tour-url">Matterport Share URL</Label>
        <Input
          id="tour-url"
          type="url"
          placeholder="https://my.matterport.com/show/?m=..."
          value={tourUrl}
          onChange={(e) => setTourUrl(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Paste your Matterport share URL here
        </p>
      </div>
      <Button type="submit" disabled={!tourUrl.trim() || isLoading} className="w-full">
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Tour
          </>
        )}
      </Button>
    </form>
  );
}

function TourEditForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  initialData: TourData;
  onSubmit: (data: Partial<TourData>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    matterportTourUrl: initialData.matterportTourUrl || '',
    tourDescription: initialData.tourMetadata?.tourDescription || '',
    features: initialData.tourMetadata?.features?.join(', ') || '',
    roomLabels: initialData.tourMetadata?.roomLabels?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      matterportTourUrl: formData.matterportTourUrl,
      tourMetadata: {
        ...initialData.tourMetadata,
        tourDescription: formData.tourDescription,
        features: formData.features ? formData.features.split(',').map(s => s.trim()) : [],
        roomLabels: formData.roomLabels ? formData.roomLabels.split(',').map(s => s.trim()) : []
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-tour-url">Matterport URL</Label>
          <Input
            id="edit-tour-url"
            type="url"
            value={formData.matterportTourUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, matterportTourUrl: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="tour-features">Tour Features (comma-separated)</Label>
          <Input
            id="tour-features"
            placeholder="Pool, Fitness Center, Dining Room"
            value={formData.features}
            onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tour-description">Tour Description</Label>
        <Textarea
          id="tour-description"
          rows={3}
          placeholder="Describe what families will see in this virtual tour..."
          value={formData.tourDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, tourDescription: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="room-labels">Room Labels (comma-separated)</Label>
        <Input
          id="room-labels"
          placeholder="Lobby, Dining Room, Activity Center, Sample Apartment"
          value={formData.roomLabels}
          onChange={(e) => setFormData(prev => ({ ...prev, roomLabels: e.target.value }))}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}