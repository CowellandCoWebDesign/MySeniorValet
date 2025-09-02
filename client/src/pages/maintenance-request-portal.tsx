import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Home,
  Droplet,
  Zap,
  Thermometer,
  Wind,
  Lock,
  Lightbulb,
  Volume2,
  WifiOff,
  Bug,
  Camera,
  Plus,
  FileText,
  Calendar,
  User,
  MessageSquare,
  Star,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function MaintenanceRequestPortal() {
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('normal');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [permissionToEnter, setPermissionToEnter] = useState(false);
  const { toast } = useToast();

  // Fetch maintenance data
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['/api/operations/maintenance-requests'],
    queryFn: async () => {
      // Mock data for demo - would connect to real API
      return {
        activeRequests: [
          {
            id: 'MR-001',
            date: '2025-08-28',
            category: 'Plumbing',
            issue: 'Leaky faucet in bathroom',
            location: 'Apartment 204B - Bathroom',
            priority: 'normal',
            status: 'in_progress',
            assignedTo: 'Mike T.',
            estimatedCompletion: '2025-09-03',
            notes: 'Parts ordered, will complete once received'
          },
          {
            id: 'MR-002',
            date: '2025-08-30',
            category: 'Electrical',
            issue: 'Bedroom light flickering',
            location: 'Apartment 204B - Master Bedroom',
            priority: 'normal',
            status: 'scheduled',
            assignedTo: 'John D.',
            scheduledDate: '2025-09-04',
            scheduledTime: '10:00 AM'
          }
        ],
        completedRequests: [
          {
            id: 'MR-099',
            date: '2025-08-15',
            category: 'HVAC',
            issue: 'AC not cooling properly',
            location: 'Apartment 204B',
            priority: 'high',
            status: 'completed',
            completedDate: '2025-08-16',
            completedBy: 'Tom R.',
            resolution: 'Replaced air filter and recharged refrigerant',
            satisfaction: 5
          },
          {
            id: 'MR-098',
            date: '2025-08-10',
            category: 'General',
            issue: 'Door handle loose',
            location: 'Apartment 204B - Front door',
            priority: 'low',
            status: 'completed',
            completedDate: '2025-08-11',
            completedBy: 'Mike T.',
            resolution: 'Tightened screws and lubricated mechanism',
            satisfaction: 4
          }
        ],
        maintenanceTeam: [
          { name: 'Mike T.', specialty: 'General Maintenance', available: true },
          { name: 'John D.', specialty: 'Electrical', available: true },
          { name: 'Tom R.', specialty: 'HVAC', available: false },
          { name: 'Sarah M.', specialty: 'Plumbing', available: true }
        ],
        commonIssues: [
          { category: 'Plumbing', issue: 'Leaky faucet', avgResolutionTime: '2 days' },
          { category: 'Electrical', issue: 'Light not working', avgResolutionTime: '1 day' },
          { category: 'HVAC', issue: 'Temperature issues', avgResolutionTime: '1 day' },
          { category: 'General', issue: 'Door/Window issues', avgResolutionTime: '1 day' }
        ]
      };
    }
  });

  // Submit maintenance request
  const submitRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return apiRequest('POST', '/api/operations/work-orders', requestData);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your maintenance request has been received. We'll contact you soon.",
      });
      // Reset form
      setCategory('');
      setPriority('normal');
      setLocation('');
      setDescription('');
      setPreferredTime('');
      setPermissionToEnter(false);
      queryClient.invalidateQueries({ queryKey: ['/api/operations/maintenance-requests'] });
    }
  });

  const handleSubmitRequest = () => {
    if (category && location && description) {
      submitRequestMutation.mutate({
        category,
        priority,
        location,
        description,
        preferredTime,
        permissionToEnter
      });
    }
  };

  const categoryIcons = {
    Plumbing: Droplet,
    Electrical: Zap,
    HVAC: Thermometer,
    Appliance: Home,
    Pest: Bug,
    General: Wrench,
    Emergency: AlertTriangle
  };

  const priorityColors = {
    low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    normal: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    emergency: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wrench className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading maintenance portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Maintenance Request Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit and track maintenance requests for your apartment
          </p>
        </div>

        {/* Emergency Notice */}
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>For emergencies</strong> (flooding, no heat, electrical hazards), call maintenance immediately at 
            <span className="font-bold ml-1">(555) 911-HELP</span> - Available 24/7
          </AlertDescription>
        </Alert>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Requests</p>
                  <p className="text-2xl font-bold">{maintenanceData?.activeRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed This Month</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution</p>
                  <p className="text-xl font-bold">1.5 days</p>
                </div>
                <Wrench className="h-8 w-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p>
                  <div className="flex items-center">
                    <span className="text-xl font-bold mr-1">4.8</span>
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                </div>
                <Star className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="new-request" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="active">Active Requests</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="info">Maintenance Info</TabsTrigger>
          </TabsList>

          {/* New Request Tab */}
          <TabsContent value="new-request" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit Maintenance Request</CardTitle>
                  <CardDescription>Describe the issue and we'll send help</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Issue Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing (leaks, drainage)</SelectItem>
                        <SelectItem value="electrical">Electrical (lights, outlets)</SelectItem>
                        <SelectItem value="hvac">HVAC (heating, cooling, ventilation)</SelectItem>
                        <SelectItem value="appliance">Appliance (fridge, stove, washer)</SelectItem>
                        <SelectItem value="pest">Pest Control</SelectItem>
                        <SelectItem value="general">General Maintenance</SelectItem>
                        <SelectItem value="emergency">EMERGENCY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait a few days</SelectItem>
                        <SelectItem value="normal">Normal - Within 48 hours</SelectItem>
                        <SelectItem value="high">High - Within 24 hours</SelectItem>
                        <SelectItem value="emergency">Emergency - Immediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location in Apartment</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Kitchen, Master Bathroom, Living Room"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Describe the Issue</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide details about the problem..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferred-time">Preferred Service Time</Label>
                    <Select value={preferredTime} onValueChange={setPreferredTime}>
                      <SelectTrigger id="preferred-time">
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                        <SelectItem value="anytime">Any time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="permission"
                      checked={permissionToEnter}
                      onChange={(e) => setPermissionToEnter(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="permission">
                      Permission to enter if I'm not home
                    </Label>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={handleSubmitRequest}
                      disabled={!category || !location || !description}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Request
                    </Button>
                    <Button variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Add Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Common Issues Guide */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Issues & Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplet className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Clogged Drain</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Try using a plunger first. Avoid chemical drain cleaners.
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Light Not Working</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check if bulb needs replacing. Try other outlets/switches.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Thermometer className="h-4 w-4 text-green-600" />
                        <span className="font-medium">AC/Heat Issues</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check thermostat settings and replace filter if needed.
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <WifiOff className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">No Power</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Check circuit breaker. Call emergency line if widespread.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-600 font-medium">Emergency</span>
                        <span>Within 1 hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600 font-medium">High Priority</span>
                        <span>Within 24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600 font-medium">Normal</span>
                        <span>Within 48 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 font-medium">Low Priority</span>
                        <span>Within 3-5 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Active Requests Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Your Active Maintenance Requests</CardTitle>
                <CardDescription>Track the status of your open requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceData?.activeRequests.map((request) => {
                    const Icon = categoryIcons[request.category as keyof typeof categoryIcons] || Wrench;
                    return (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-lg ${
                              request.status === 'in_progress' 
                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                              <Icon className={`h-6 w-6 ${
                                request.status === 'in_progress'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{request.issue}</h4>
                                <Badge>{request.id}</Badge>
                                <Badge 
                                  variant={request.status === 'in_progress' ? 'default' : 'secondary'}
                                >
                                  {request.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <Home className="inline h-3 w-3 mr-1" />
                                {request.location}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Submitted: {new Date(request.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  Assigned: {request.assignedTo}
                                </span>
                              </div>
                              {request.estimatedCompletion && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                  Estimated completion: {new Date(request.estimatedCompletion).toLocaleDateString()}
                                </p>
                              )}
                              {request.scheduledDate && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                  Scheduled: {new Date(request.scheduledDate).toLocaleDateString()} at {request.scheduledTime}
                                </p>
                              )}
                              {request.notes && (
                                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <p className="text-sm font-medium mb-1">Update:</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Completed Requests</CardTitle>
                <CardDescription>Your maintenance history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceData?.completedRequests.map((request) => {
                    const Icon = categoryIcons[request.category as keyof typeof categoryIcons] || Wrench;
                    return (
                      <div key={request.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{request.issue}</h4>
                                <Badge variant="outline">{request.id}</Badge>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {request.location}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Submitted: {new Date(request.date).toLocaleDateString()}</span>
                                <span>Completed: {new Date(request.completedDate).toLocaleDateString()}</span>
                                <span>By: {request.completedBy}</span>
                              </div>
                              <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded">
                                <p className="text-sm font-medium mb-1">Resolution:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{request.resolution}</p>
                              </div>
                              {request.satisfaction && (
                                <div className="flex items-center gap-1 mt-2">
                                  <span className="text-sm mr-2">Your rating:</span>
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < request.satisfaction 
                                          ? 'text-yellow-500 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Info Tab */}
          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Maintenance Team */}
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenanceData?.maintenanceTeam.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.specialty}</p>
                        </div>
                        <Badge variant={member.available ? 'default' : 'secondary'}>
                          {member.available ? 'Available' : 'Busy'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Preventive Maintenance Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Monthly</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Test smoke detectors and replace HVAC filters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Quarterly</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clean refrigerator coils and check for leaks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Annually</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Deep clean appliances and check caulking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}