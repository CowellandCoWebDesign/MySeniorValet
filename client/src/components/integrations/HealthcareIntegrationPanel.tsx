import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { 
  Activity, Heart, Brain, Pill, FileText, Shield, AlertCircle,
  CheckCircle, Clock, Calendar, User, Users, Download, Upload,
  Stethoscope, Thermometer, Droplet, Wind, Eye, Ear, Footprints,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Settings,
  RefreshCw, Share2, Lock, Unlock, Database, Link2, Zap, Hospital
} from 'lucide-react';

interface HealthcareIntegrationPanelProps {
  communityId: number;
  tierLevel: 'premium' | 'enterprise';
  residentId?: string;
}

interface HealthRecord {
  id: string;
  residentName: string;
  residentId: string;
  type: 'vital' | 'medication' | 'lab' | 'assessment' | 'note' | 'order';
  category: string;
  date: Date;
  provider: string;
  status: 'normal' | 'attention' | 'critical';
  data: any;
  source: 'epic' | 'cerner' | 'manual';
  lastUpdated: Date;
}

interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number; trend: string };
  heartRate: { value: number; trend: string };
  temperature: { value: number; unit: string };
  oxygenSat: { value: number; trend: string };
  respiratoryRate: { value: number; trend: string };
  weight: { value: number; unit: string; trend: string };
  bloodGlucose: { value: number; trend: string };
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescriber: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'discontinued' | 'hold';
  lastAdministered?: Date;
  nextDue?: Date;
  interactions?: string[];
  sideEffects?: string[];
}

export function HealthcareIntegrationPanel({ communityId, tierLevel, residentId }: HealthcareIntegrationPanelProps) {
  const { toast } = useToast();
  const [selectedResident, setSelectedResident] = useState(residentId || '');
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<'epic' | 'cerner'>('epic');
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Fetch healthcare integration status
  const { data: integrationStatus } = useQuery({
    queryKey: [`/api/communities/${communityId}/healthcare/status`],
  });

  // Fetch residents list
  const { data: residentsData } = useQuery({
    queryKey: [`/api/communities/${communityId}/residents`],
  });

  // Fetch health records for selected resident
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/residents/${selectedResident}/health`],
    enabled: !!selectedResident,
  });

  // Sync with Epic/Cerner
  const syncHealthDataMutation = useMutation({
    mutationFn: async () => {
      setSyncInProgress(true);
      return await apiRequest('POST', `/api/healthcare/${selectedSystem}/sync`, {
        communityId,
        residentId: selectedResident
      });
    },
    onSuccess: (data) => {
      setSyncInProgress(false);
      toast({
        title: "Healthcare Data Synced",
        description: `Successfully synced ${data.recordsUpdated} records from ${selectedSystem === 'epic' ? 'Epic' : 'Cerner'}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/residents/${selectedResident}/health`] });
    },
    onError: (error: any) => {
      setSyncInProgress(false);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync healthcare data",
        variant: "destructive",
      });
    }
  });

  // Connect to Epic/Cerner
  const connectSystemMutation = useMutation({
    mutationFn: async (credentials: any) => {
      return await apiRequest('POST', `/api/healthcare/${selectedSystem}/connect`, {
        communityId,
        ...credentials
      });
    },
    onSuccess: () => {
      toast({
        title: "System Connected",
        description: `Successfully connected to ${selectedSystem === 'epic' ? 'Epic' : 'Cerner'}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/healthcare/status`] });
      setShowConnectionDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to healthcare system",
        variant: "destructive",
      });
    }
  });

  const vitals = healthData?.vitals || {};
  const medications = healthData?.medications || [];
  const labResults = healthData?.labResults || [];
  const assessments = healthData?.assessments || [];
  const careAlerts = healthData?.alerts || [];

  const isEpicConnected = integrationStatus?.epic?.connected || false;
  const isCernerConnected = integrationStatus?.cerner?.connected || false;

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-blue-600" />
                Healthcare Integration Center
              </CardTitle>
              <CardDescription>
                Connect to Epic & Cerner for real-time health data access
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEpicConnected && (
                <Badge variant="outline" className="bg-purple-50">
                  <CheckCircle className="w-3 h-3 mr-1 text-purple-600" />
                  Epic Connected
                </Badge>
              )}
              {isCernerConnected && (
                <Badge variant="outline" className="bg-orange-50">
                  <CheckCircle className="w-3 h-3 mr-1 text-orange-600" />
                  Cerner Connected
                </Badge>
              )}
              {tierLevel === 'enterprise' && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time Sync
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Select Resident</Label>
              <Select value={selectedResident} onValueChange={setSelectedResident}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resident" />
                </SelectTrigger>
                <SelectContent>
                  {residentsData?.residents?.map((resident: any) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name} - Room {resident.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => syncHealthDataMutation.mutate()}
              disabled={!selectedResident || syncInProgress}
              className="mt-6"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
              Sync Health Data
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConnectionDialog(true)}
              className="mt-6"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Systems
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {careAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertTitle className="text-red-900">Care Alerts</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {careAlerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-red-800">{alert.message}</span>
                  <Badge variant="destructive">{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Health Dashboard */}
      {selectedResident && (
        <Tabs defaultValue="vitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="labs">Lab Results</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.bloodPressure?.systolic || '--'}/{vitals.bloodPressure?.diastolic || '--'}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {vitals.bloodPressure?.trend === 'up' ? 
                      <TrendingUp className="w-4 h-4 text-red-500" /> :
                      vitals.bloodPressure?.trend === 'down' ?
                      <TrendingDown className="w-4 h-4 text-green-500" /> :
                      <Minus className="w-4 h-4 text-gray-500" />
                    }
                    <span className="text-sm text-gray-600">mmHg</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.heartRate?.value || '--'}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {vitals.heartRate?.trend === 'up' ? 
                      <TrendingUp className="w-4 h-4 text-orange-500" /> :
                      vitals.heartRate?.trend === 'down' ?
                      <TrendingDown className="w-4 h-4 text-blue-500" /> :
                      <Minus className="w-4 h-4 text-gray-500" />
                    }
                    <span className="text-sm text-gray-600">bpm</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-yellow-500" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.temperature?.value || '--'}°
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {vitals.temperature?.unit || 'F'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-500" />
                    O2 Saturation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.oxygenSat?.value || '--'}%
                  </div>
                  <Progress 
                    value={vitals.oxygenSat?.value || 0} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-indigo-500" />
                    Blood Glucose
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.bloodGlucose?.value || '--'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">mg/dL</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-green-500" />
                    Weight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vitals.weight?.value || '--'}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {vitals.weight?.trend === 'up' ? 
                      <TrendingUp className="w-4 h-4 text-orange-500" /> :
                      vitals.weight?.trend === 'down' ?
                      <TrendingDown className="w-4 h-4 text-blue-500" /> :
                      <Minus className="w-4 h-4 text-gray-500" />
                    }
                    <span className="text-sm text-gray-600">{vitals.weight?.unit || 'lbs'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Medications</CardTitle>
                  <Badge>{medications.filter((m: Medication) => m.status === 'active').length} Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {medications.map((med: Medication) => (
                      <div key={med.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{med.name}</h4>
                              <Badge 
                                variant={med.status === 'active' ? 'default' : 
                                        med.status === 'hold' ? 'secondary' : 'outline'}
                              >
                                {med.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Pill className="w-3 h-3" />
                                {med.dosage} - {med.frequency}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Dr. {med.prescriber}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Started: {format(new Date(med.startDate), 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Next: {med.nextDue ? format(new Date(med.nextDue), 'h:mm a') : 'N/A'}
                              </div>
                            </div>
                            {med.interactions && med.interactions.length > 0 && (
                              <Alert className="mt-2">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>
                                  Drug interactions: {med.interactions.join(', ')}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="labs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Lab Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {labResults.map((lab: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{lab.testName}</h4>
                          <Badge variant={lab.status === 'normal' ? 'outline' : 
                                         lab.status === 'abnormal' ? 'destructive' : 'secondary'}>
                            {lab.status}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Result:</span>
                            <span className="ml-2 font-medium">{lab.value} {lab.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Range:</span>
                            <span className="ml-2">{lab.normalRange}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2">{format(new Date(lab.date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {assessments.map((assessment: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-sm">{assessment.type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className="font-semibold">{assessment.score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Risk Level:</span>
                            <Badge variant={assessment.risk === 'low' ? 'outline' : 
                                          assessment.risk === 'medium' ? 'secondary' : 'destructive'}>
                              {assessment.risk}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Updated:</span>
                            <span className="text-sm">{format(new Date(assessment.date), 'MMM d')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Health History Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {healthData?.history?.map((event: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            event.type === 'admission' ? 'bg-blue-500' :
                            event.type === 'discharge' ? 'bg-green-500' :
                            event.type === 'emergency' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`} />
                          {index < (healthData?.history?.length - 1) && (
                            <div className="w-0.5 h-16 bg-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Configure Systems Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Healthcare Systems</DialogTitle>
            <DialogDescription>
              Connect to Epic or Cerner for real-time health data access
            </DialogDescription>
          </DialogHeader>
          <Tabs value={selectedSystem} onValueChange={(v) => setSelectedSystem(v as 'epic' | 'cerner')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="epic">Epic</TabsTrigger>
              <TabsTrigger value="cerner">Cerner</TabsTrigger>
            </TabsList>
            <TabsContent value="epic" className="space-y-4">
              <div>
                <Label>Epic Client ID</Label>
                <Input placeholder="Enter your Epic client ID" />
              </div>
              <div>
                <Label>Epic Client Secret</Label>
                <Input type="password" placeholder="Enter your Epic client secret" />
              </div>
              <div>
                <Label>Epic FHIR Endpoint</Label>
                <Input placeholder="https://epic-server.com/fhir" />
              </div>
            </TabsContent>
            <TabsContent value="cerner" className="space-y-4">
              <div>
                <Label>Cerner System ID</Label>
                <Input placeholder="Enter your Cerner system ID" />
              </div>
              <div>
                <Label>Cerner API Key</Label>
                <Input type="password" placeholder="Enter your Cerner API key" />
              </div>
              <div>
                <Label>Cerner FHIR URL</Label>
                <Input placeholder="https://cerner-server.com/fhir" />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-3 mt-4">
            <Button
              className="flex-1"
              onClick={() => connectSystemMutation.mutate({
                system: selectedSystem,
                // Form data would be collected here
              })}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connect {selectedSystem === 'epic' ? 'Epic' : 'Cerner'}
            </Button>
            <Button variant="outline" onClick={() => setShowConnectionDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}