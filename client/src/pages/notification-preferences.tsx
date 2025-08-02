import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Camera, DollarSign, Home, Star, Trophy, AlertCircle, Clock, Save } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationPreferences {
  emailEnabled: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  communityUpdates: boolean;
  priceChanges: boolean;
  newPhotos: boolean;
  newReviews: boolean;
  availabilityChanges: boolean;
  milestones: boolean;
  systemAnnouncements: boolean;
  watchedCommunities: number[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

export function NotificationPreferencesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  
  // Fetch preferences
  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences'],
  });
  
  const [formData, setFormData] = useState<NotificationPreferences>({
    emailEnabled: true,
    emailFrequency: 'immediate',
    communityUpdates: true,
    priceChanges: true,
    newPhotos: true,
    newReviews: true,
    availabilityChanges: true,
    milestones: true,
    systemAnnouncements: true,
    watchedCommunities: [],
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'America/New_York'
  });
  
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);
  
  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) => 
      apiRequest('PUT', '/api/notifications/preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated successfully"
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleChange = (field: keyof NotificationPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };
  
  const handleSave = () => {
    updateMutation.mutate(formData);
  };
  
  // Create test notification
  const testNotificationMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/test'),
    onSuccess: () => {
      toast({
        title: "Test notification sent",
        description: "Check your notification center to see the test notification"
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notification Preferences</h1>
              <p className="text-gray-600 mt-2">Manage how and when you receive notifications</p>
            </div>
            <Button onClick={() => testNotificationMutation.mutate()} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Send Test
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
            <TabsTrigger value="quiet-hours">Quiet Hours</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
                <CardDescription>
                  Choose which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Community Updates</Label>
                    <p className="text-sm text-gray-600">
                      Get notified about general updates to communities you're watching
                    </p>
                  </div>
                  <Switch
                    checked={formData.communityUpdates}
                    onCheckedChange={(checked) => handleChange('communityUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price Changes
                    </Label>
                    <p className="text-sm text-gray-600">
                      Be alerted when pricing changes for communities you're watching
                    </p>
                  </div>
                  <Switch
                    checked={formData.priceChanges}
                    onCheckedChange={(checked) => handleChange('priceChanges', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      New Photos
                    </Label>
                    <p className="text-sm text-gray-600">
                      Know when new photos are added to communities
                    </p>
                  </div>
                  <Switch
                    checked={formData.newPhotos}
                    onCheckedChange={(checked) => handleChange('newPhotos', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      New Reviews
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified when new reviews are posted
                    </p>
                  </div>
                  <Switch
                    checked={formData.newReviews}
                    onCheckedChange={(checked) => handleChange('newReviews', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Availability Changes
                    </Label>
                    <p className="text-sm text-gray-600">
                      Be informed about availability updates
                    </p>
                  </div>
                  <Switch
                    checked={formData.availabilityChanges}
                    onCheckedChange={(checked) => handleChange('availabilityChanges', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Milestones
                    </Label>
                    <p className="text-sm text-gray-600">
                      Celebrate when communities reach important milestones
                    </p>
                  </div>
                  <Switch
                    checked={formData.milestones}
                    onCheckedChange={(checked) => handleChange('milestones', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      System Announcements
                    </Label>
                    <p className="text-sm text-gray-600">
                      Important platform updates and announcements
                    </p>
                  </div>
                  <Switch
                    checked={formData.systemAnnouncements}
                    onCheckedChange={(checked) => handleChange('systemAnnouncements', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={formData.emailEnabled}
                    onCheckedChange={(checked) => handleChange('emailEnabled', checked)}
                  />
                </div>
                
                {formData.emailEnabled && (
                  <div className="space-y-2">
                    <Label>Email Frequency</Label>
                    <Select
                      value={formData.emailFrequency}
                      onValueChange={(value) => handleChange('emailFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediately</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600">
                      How often should we send you email notifications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quiet-hours">
            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>
                  Set times when you don't want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Enable Quiet Hours
                    </Label>
                    <p className="text-sm text-gray-600">
                      Pause notifications during specified hours
                    </p>
                  </div>
                  <Switch
                    checked={formData.quietHoursEnabled}
                    onCheckedChange={(checked) => handleChange('quietHoursEnabled', checked)}
                  />
                </div>
                
                {formData.quietHoursEnabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={formData.quietHoursStart}
                          onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={formData.quietHoursEnd}
                          onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => handleChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="America/Phoenix">Arizona Time</SelectItem>
                          <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="text-sm text-gray-600">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(preferences || formData);
                    setHasChanges(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}