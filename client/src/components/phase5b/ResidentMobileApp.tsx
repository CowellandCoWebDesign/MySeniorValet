import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  User, 
  Settings, 
  Bell, 
  Heart, 
  Activity,
  Pill,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  Wifi,
  Battery,
  Volume2,
  Eye,
  Type,
  Sun,
  Moon,
  Shield,
  QrCode,
  Download,
  Upload,
  CheckCircle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ResidentMobileAppProps {
  communityId: number;
  residents: any[];
}

export function ResidentMobileApp({ communityId, residents }: ResidentMobileAppProps) {
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [appSettings, setAppSettings] = useState({
    notificationsEnabled: true,
    locationSharingEnabled: false,
    emergencyAlertEnabled: true,
    activityReminders: true,
    medicationReminders: true,
    mealReminders: true,
    fontSize: 'medium',
    highContrast: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update app settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest(
        'PUT',
        `/api/resident-family/residents/${selectedResident?.id}/app-settings`,
        { appSettings: settings }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Mobile app settings have been saved",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/communities/${communityId}/residents`] });
    }
  });

  // Generate QR code for mobile app setup
  const generateQRCode = () => {
    if (!selectedResident) return;
    
    const setupData = {
      communityId,
      residentId: selectedResident.id,
      serverUrl: window.location.origin,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, this would generate an actual QR code
    const qrData = btoa(JSON.stringify(setupData));
    
    toast({
      title: "QR Code Generated",
      description: "Scan this code with the MySeniorValet mobile app to set up the resident's device",
    });
    
    return qrData;
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    if (selectedResident) {
      updateSettingsMutation.mutate(newSettings);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resident Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Resident</CardTitle>
          <CardDescription>Choose a resident to configure their mobile app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select 
              value={selectedResident?.id?.toString()} 
              onValueChange={(value) => {
                const resident = residents.find(r => r.id === parseInt(value));
                setSelectedResident(resident);
                if (resident?.appSettings) {
                  setAppSettings(resident.appSettings);
                }
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a resident" />
              </SelectTrigger>
              <SelectContent>
                {residents.map((resident) => (
                  <SelectItem key={resident.id} value={resident.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{resident.userId}</span>
                      {resident.roomNumber && (
                        <Badge variant="secondary">Room {resident.roomNumber}</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Add New Resident
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedResident && (
        <Tabs defaultValue="setup" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="setup">
              <Smartphone className="mr-2 h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="health">
              <Heart className="mr-2 h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mobile App Setup</CardTitle>
                  <CardDescription>Quick setup for resident's device</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-8 bg-muted rounded-lg">
                    <div className="text-center space-y-4">
                      <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        QR Code for quick device setup
                      </p>
                      <Button onClick={generateQRCode}>
                        Generate Setup QR Code
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Manual Setup Code</Label>
                    <div className="flex gap-2">
                      <Input value={`MSV-${selectedResident.id}-${Date.now()}`} readOnly />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter this code in the mobile app to connect
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Status</CardTitle>
                  <CardDescription>Connected devices and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedResident.deviceTokens?.length > 0 ? (
                      selectedResident.deviceTokens.map((device: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5" />
                            <div>
                              <p className="font-medium">{device.platform === 'ios' ? 'iPhone' : 'Android'}</p>
                              <p className="text-xs text-muted-foreground">
                                Last active: {format(new Date(device.lastActive), 'PPp')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Wifi className="h-3 w-3" />
                              Connected
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Battery className="h-3 w-3" />
                              85%
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Smartphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No devices connected</p>
                        <p className="text-sm">Set up the mobile app to connect</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize the mobile experience for {selectedResident.userId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="notifications">Enable Notifications</Label>
                      </div>
                      <Switch
                        id="notifications"
                        checked={appSettings.notificationsEnabled}
                        onCheckedChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="activity-reminders">Activity Reminders</Label>
                      </div>
                      <Switch
                        id="activity-reminders"
                        checked={appSettings.activityReminders}
                        onCheckedChange={(checked) => handleSettingChange('activityReminders', checked)}
                        disabled={!appSettings.notificationsEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="medication-reminders">Medication Reminders</Label>
                      </div>
                      <Switch
                        id="medication-reminders"
                        checked={appSettings.medicationReminders}
                        onCheckedChange={(checked) => handleSettingChange('medicationReminders', checked)}
                        disabled={!appSettings.notificationsEnabled}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Accessibility Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Accessibility</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="font-size" className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        Font Size
                      </Label>
                      <Select
                        value={appSettings.fontSize}
                        onValueChange={(value) => handleSettingChange('fontSize', value)}
                      >
                        <SelectTrigger id="font-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xlarge">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="high-contrast">High Contrast Mode</Label>
                      </div>
                      <Switch
                        id="high-contrast"
                        checked={appSettings.highContrast}
                        onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Safety Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Safety & Privacy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="emergency-alert">Emergency Alert Button</Label>
                      </div>
                      <Switch
                        id="emergency-alert"
                        checked={appSettings.emergencyAlertEnabled}
                        onCheckedChange={(checked) => handleSettingChange('emergencyAlertEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="location-sharing">Location Sharing</Label>
                      </div>
                      <Switch
                        id="location-sharing"
                        checked={appSettings.locationSharingEnabled}
                        onCheckedChange={(checked) => handleSettingChange('locationSharingEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Information</CardTitle>
                <CardDescription>Medical details and emergency contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Care Level</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedResident.careLevel || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <Label>Mobility Status</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedResident.mobilityStatus || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <Label>Allergies</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedResident.allergies?.length > 0 ? (
                          selectedResident.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} variant="destructive">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">None recorded</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Emergency Contacts</Label>
                      <div className="space-y-2 mt-2">
                        {selectedResident.emergencyContacts?.map((contact: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <Phone className="h-4 w-4" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {contact.relationship} - {contact.phone}
                              </p>
                            </div>
                            {contact.isPrimary && (
                              <Badge variant="secondary">Primary</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Dashboard</CardTitle>
                <CardDescription>Monitor resident engagement and participation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Activity tracking coming soon</p>
                  <p className="text-sm">View participation rates and engagement metrics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}