import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  Shield, 
  FileText,
  Activity,
  Pill,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  Brain,
  Syringe,
  Thermometer,
  Zap,
  Filter,
  Search,
  Settings,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyHealthRecordsProps {
  residentId?: string;
  communityId?: string;
  tierLevel?: 'premium' | 'enterprise';
}

export function FamilyHealthRecords({ residentId = 'demo', communityId = 'demo', tierLevel = 'premium' }: FamilyHealthRecordsProps) {
  const { toast } = useToast();
  const [activeRecord, setActiveRecord] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [showSensitive, setShowSensitive] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');

  // Demo health records
  const healthRecords = [
    {
      id: '1',
      residentName: 'Margaret Johnson',
      room: '204A',
      lastUpdated: '2 hours ago',
      status: 'stable',
      alerts: 2,
      avatar: 'MJ'
    },
    {
      id: '2',
      residentName: 'Robert Smith',
      room: '312B',
      lastUpdated: '5 hours ago',
      status: 'monitoring',
      alerts: 1,
      avatar: 'RS'
    },
    {
      id: '3',
      residentName: 'Eleanor Davis',
      room: '108',
      lastUpdated: '1 day ago',
      status: 'stable',
      alerts: 0,
      avatar: 'ED'
    }
  ];

  // Vital signs data
  const vitalSigns = {
    bloodPressure: { value: '120/80', trend: 'stable', lastChecked: '8:00 AM' },
    heartRate: { value: '72 bpm', trend: 'stable', lastChecked: '8:00 AM' },
    temperature: { value: '98.6°F', trend: 'stable', lastChecked: '8:00 AM' },
    oxygenSat: { value: '98%', trend: 'stable', lastChecked: '8:00 AM' },
    weight: { value: '145 lbs', trend: 'down', change: '-2 lbs', lastChecked: 'Yesterday' },
    bloodSugar: { value: '95 mg/dL', trend: 'stable', lastChecked: '7:30 AM' }
  };

  // Medications
  const medications = [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      purpose: 'Blood pressure',
      nextDose: '8:00 PM',
      compliance: 98
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      purpose: 'Diabetes',
      nextDose: '2:00 PM',
      compliance: 95
    },
    {
      name: 'Vitamin D',
      dosage: '2000 IU',
      frequency: 'Once daily',
      purpose: 'Supplement',
      nextDose: '8:00 AM',
      compliance: 100
    }
  ];

  // Recent assessments
  const assessments = [
    {
      date: 'Dec 10, 2024',
      type: 'Cognitive Assessment',
      score: '28/30',
      result: 'Normal',
      provider: 'Dr. Sarah Chen'
    },
    {
      date: 'Dec 8, 2024',
      type: 'Fall Risk Assessment',
      score: 'Low Risk',
      result: 'No intervention needed',
      provider: 'PT Team'
    },
    {
      date: 'Dec 5, 2024',
      type: 'Nutritional Assessment',
      score: 'Good',
      result: 'Maintaining weight',
      provider: 'Dietitian'
    }
  ];

  // Access permissions
  const accessPermissions = [
    {
      id: '1',
      name: 'Sarah Johnson',
      relationship: 'Daughter (POA)',
      access: 'full',
      lastAccess: '1 hour ago'
    },
    {
      id: '2',
      name: 'Michael Johnson',
      relationship: 'Son',
      access: 'view',
      lastAccess: '2 days ago'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      relationship: 'Primary Physician',
      access: 'full',
      lastAccess: 'Today'
    }
  ];

  const grantAccess = (userId: string, level: string) => {
    toast({
      title: "Access Updated",
      description: `Permission level changed to ${level}`,
    });
  };

  const exportRecords = () => {
    toast({
      title: "Exporting Records",
      description: "Health records PDF will be downloaded shortly",
    });
  };

  const shareWithProvider = () => {
    toast({
      title: "Sharing Records",
      description: "Records shared with healthcare provider",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Family Health Records Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Secure access to resident health information with permission controls
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">
                <Shield className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
              {tierLevel === 'enterprise' && (
                <Badge className="bg-purple-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time Sync
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={exportRecords}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={shareWithProvider}>
              <Share2 className="w-4 h-4 mr-2" />
              Share with Provider
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Permissions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vitals">
            <Thermometer className="w-4 h-4 mr-2" />
            Vitals
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="w-4 h-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <Stethoscope className="w-4 h-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Resident List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Residents</CardTitle>
                <CardDescription>Select a resident to view records</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {healthRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        activeRecord === record.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setActiveRecord(record.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{record.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.residentName}</p>
                            <p className="text-sm text-muted-foreground">Room {record.room}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={record.status === 'stable' ? 'default' : 'outline'} 
                                 className={record.status === 'monitoring' ? 'border-amber-500 text-amber-600' : ''}>
                            {record.status}
                          </Badge>
                          {record.alerts > 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              {record.alerts} alert{record.alerts > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Health Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Health Summary</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      {viewMode === 'summary' ? 'Summary' : 'Detailed'}
                    </Button>
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 Days</SelectItem>
                        <SelectItem value="30days">30 Days</SelectItem>
                        <SelectItem value="90days">90 Days</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeRecord ? (
                  <div className="space-y-6">
                    {/* Vital Signs Summary */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Current Vital Signs
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Blood Pressure</p>
                          <p className="font-semibold">{vitalSigns.bloodPressure.value}</p>
                          <Badge variant="outline" className="mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Normal
                          </Badge>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Heart Rate</p>
                          <p className="font-semibold">{vitalSigns.heartRate.value}</p>
                          <Badge variant="outline" className="mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Normal
                          </Badge>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">O2 Saturation</p>
                          <p className="font-semibold">{vitalSigns.oxygenSat.value}</p>
                          <Badge variant="outline" className="mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Normal
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Recent Alerts */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Recent Alerts
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <div>
                              <p className="font-medium text-sm">Weight Loss Alert</p>
                              <p className="text-xs text-muted-foreground">Lost 2 lbs in past week</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Pill className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">Medication Reminder</p>
                              <p className="text-xs text-muted-foreground">Metformin due at 2:00 PM</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">30 min ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Care Team Notes */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Latest Care Team Notes
                      </h4>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>RN</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">Nurse Sarah</p>
                              <span className="text-xs text-muted-foreground">Today, 10:30 AM</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Resident in good spirits today. Participated in morning activities. 
                              Appetite improved - finished 80% of breakfast. Continue monitoring weight.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select a resident to view health records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs Tracking</CardTitle>
              <CardDescription>Real-time monitoring and historical trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(vitalSigns).map(([key, data]) => (
                  <Card key={key} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-2xl font-bold mt-1">{data.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last checked: {data.lastChecked}
                        </p>
                      </div>
                      <div className="text-right">
                        {data.trend === 'stable' && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Stable
                          </Badge>
                        )}
                        {data.trend === 'up' && (
                          <Badge variant="outline" className="gap-1 border-red-500 text-red-600">
                            <TrendingUp className="w-3 h-3" />
                            Rising
                          </Badge>
                        )}
                        {data.trend === 'down' && (
                          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-600">
                            <TrendingDown className="w-3 h-3" />
                            {data.change}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {tierLevel === 'enterprise' && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-900 dark:text-purple-100">
                        Enterprise Feature: Real-time Monitoring
                      </p>
                      <p className="text-purple-700 dark:text-purple-300">
                        Vital signs are updated in real-time from connected medical devices
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Medication Management</CardTitle>
              <CardDescription>Current medications and compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((med, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{med.name}</h4>
                          <Badge variant="outline">{med.dosage}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Frequency:</span> {med.frequency}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Purpose:</span> {med.purpose}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next dose:</span> {med.nextDose}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compliance:</span> {med.compliance}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {med.compliance >= 95 ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Excellent
                          </Badge>
                        ) : (
                          <Badge variant="outline">Good</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessments</CardTitle>
              <CardDescription>Recent evaluations and test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{assessment.type}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date:</span> {assessment.date}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Score:</span> {assessment.score}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Result:</span> {assessment.result}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Provider:</span> {assessment.provider}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Access Permissions</CardTitle>
                  <CardDescription>Control who can view and edit health records</CardDescription>
                </div>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Grant Access
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessPermissions.map((permission) => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{permission.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground">{permission.relationship}</p>
                          <p className="text-xs text-muted-foreground">Last access: {permission.lastAccess}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={permission.access} 
                          onValueChange={(value) => grantAccess(permission.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Access</SelectItem>
                            <SelectItem value="view">View Only</SelectItem>
                            <SelectItem value="edit">Edit</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                        {permission.access === 'full' && (
                          <Badge className="bg-green-500 text-white">
                            <Shield className="w-3 h-3 mr-1" />
                            Full
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      HIPAA Compliance Notice
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      All access is logged and monitored. Only authorized individuals with legitimate 
                      healthcare relationships should be granted access to protected health information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}