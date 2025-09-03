import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart,
  Pill,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Shield,
  Activity,
  Stethoscope,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface CareCoordinationManagerProps {
  residentId?: string;
  viewMode: 'community' | 'family';
  tier?: string;
}

export default function CareCoordinationManager({ residentId, viewMode, tier }: CareCoordinationManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);

  const canEdit = viewMode === 'community';

  // Mock data for demonstration
  const healthMetrics = {
    bloodPressure: '120/80',
    heartRate: '72 bpm',
    weight: '165 lbs',
    temperature: '98.6°F',
    lastCheckup: '2 days ago'
  };

  const medications = [
    {
      id: 1,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: '8:00 AM, 8:00 PM',
      remaining: 28,
      prescribedBy: 'Dr. Smith',
      nextRefill: 'Apr 15, 2025',
      status: 'active'
    },
    {
      id: 2,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: '9:00 AM',
      remaining: 14,
      prescribedBy: 'Dr. Johnson',
      nextRefill: 'Apr 1, 2025',
      status: 'active'
    },
    {
      id: 3,
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Once daily',
      time: '9:00 AM',
      remaining: 45,
      prescribedBy: 'Dr. Smith',
      nextRefill: 'May 1, 2025',
      status: 'active'
    }
  ];

  const appointments = [
    {
      id: 1,
      type: 'Cardiology Checkup',
      doctor: 'Dr. Emily Johnson',
      date: 'Apr 5, 2025',
      time: '10:30 AM',
      location: 'Heart Health Center',
      status: 'confirmed',
      notes: 'Annual checkup - bring medication list'
    },
    {
      id: 2,
      type: 'Physical Therapy',
      doctor: 'PT Sarah Williams',
      date: 'Apr 8, 2025',
      time: '2:00 PM',
      location: 'On-site Therapy Room',
      status: 'scheduled',
      notes: 'Session 4 of 8 - knee rehabilitation'
    },
    {
      id: 3,
      type: 'Podiatry',
      doctor: 'Dr. Michael Chen',
      date: 'Apr 12, 2025',
      time: '3:30 PM',
      location: 'Mobile Clinic Visit',
      status: 'scheduled',
      notes: 'Routine foot care'
    }
  ];

  const carePlan = {
    level: 'Assisted Living - Level 2',
    lastUpdated: 'Mar 15, 2025',
    nextReview: 'Jun 15, 2025',
    primaryDiagnoses: ['Type 2 Diabetes', 'Hypertension', 'Mild Arthritis'],
    assistanceNeeded: [
      'Medication management',
      'Bathing assistance (3x weekly)',
      'Meal preparation',
      'Transportation to appointments'
    ],
    goals: [
      { goal: 'Maintain blood sugar levels within target range', progress: 85 },
      { goal: 'Increase mobility - walk 500 steps daily', progress: 70 },
      { goal: 'Participate in 3 social activities weekly', progress: 100 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      {viewMode === 'family' && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <span className="font-semibold">Full Transparency:</span> You have complete access to your loved one's care information. All updates are synced in real-time with the care team.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="w-4 h-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="care-plan">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Care Plan
          </TabsTrigger>
          <TabsTrigger value="health-records">
            <FileText className="w-4 h-4 mr-2" />
            Records
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Current Health Metrics
                </CardTitle>
                <CardDescription>Last updated: {healthMetrics.lastCheckup}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Blood Pressure</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {healthMetrics.bloodPressure}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Heart Rate</span>
                  <Badge variant="outline">{healthMetrics.heartRate}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <Badge variant="outline">{healthMetrics.weight}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Temperature</span>
                  <Badge variant="outline">{healthMetrics.temperature}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Primary Doctor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Health Summary
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Health Concern
                </Button>
                {canEdit && (
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Medical Document
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>This Week's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Cardiology Checkup</p>
                    <p className="text-sm text-muted-foreground">Tomorrow at 10:30 AM</p>
                  </div>
                  <Badge>Confirmed</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Pill className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium">Medication Refill Due</p>
                    <p className="text-sm text-muted-foreground">Lisinopril - Apr 1</p>
                  </div>
                  <Badge variant="outline">In 3 days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medication Schedule</CardTitle>
                  <CardDescription>Current medications and administration times</CardDescription>
                </div>
                {canEdit && (
                  <Button onClick={() => setShowAddMedication(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{med.name}</h4>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Dosage:</span>
                            <span className="ml-2 font-medium">{med.dosage}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Frequency:</span>
                            <span className="ml-2 font-medium">{med.frequency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Times:</span>
                            <span className="ml-2 font-medium">{med.time}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prescribed by:</span>
                            <span className="ml-2 font-medium">{med.prescribedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm">
                              {med.remaining} doses remaining
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">
                              Next refill: {med.nextRefill}
                            </span>
                          </div>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medication Adherence */}
          <Card>
            <CardHeader>
              <CardTitle>Medication Adherence</CardTitle>
              <CardDescription>Last 30 days compliance rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Compliance</span>
                  <span className="text-2xl font-bold text-green-600">98%</span>
                </div>
                <Progress value={98} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Excellent adherence - only 2 missed doses in the last month
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Appointments</CardTitle>
                  <CardDescription>Upcoming and recent appointments</CardDescription>
                </div>
                {canEdit && (
                  <Button onClick={() => setShowAddAppointment(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold">{apt.type}</h4>
                          <Badge variant={apt.status === 'confirmed' ? 'default' : 'outline'}>
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{apt.doctor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{apt.date} at {apt.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{apt.location}</span>
                          </div>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {apt.notes}
                          </p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transportation Arrangements */}
          <Card>
            <CardHeader>
              <CardTitle>Transportation Arrangements</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Transportation is arranged for all external appointments. The facility van will be used for the cardiology appointment on Apr 5.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care Plan Tab */}
        <TabsContent value="care-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personalized Care Plan</CardTitle>
                  <CardDescription>
                    Last updated: {carePlan.lastUpdated} • Next review: {carePlan.nextReview}
                  </CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {carePlan.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Diagnoses */}
              <div>
                <h4 className="font-semibold mb-3">Primary Diagnoses</h4>
                <div className="flex flex-wrap gap-2">
                  {carePlan.primaryDiagnoses.map((diagnosis, idx) => (
                    <Badge key={idx} variant="outline">
                      {diagnosis}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Assistance Needed */}
              <div>
                <h4 className="font-semibold mb-3">Daily Assistance</h4>
                <div className="space-y-2">
                  {carePlan.assistanceNeeded.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care Goals */}
              <div>
                <h4 className="font-semibold mb-3">Care Goals & Progress</h4>
                <div className="space-y-3">
                  {carePlan.goals.map((goal, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{goal.goal}</span>
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Care Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Care Team */}
          <Card>
            <CardHeader>
              <CardTitle>Care Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { role: 'Primary Physician', name: 'Dr. Robert Smith', contact: '555-0101' },
                  { role: 'Nurse Practitioner', name: 'Sarah Johnson, NP', contact: '555-0102' },
                  { role: 'Care Coordinator', name: 'Maria Garcia', contact: '555-0103' },
                  { role: 'Physical Therapist', name: 'James Wilson, PT', contact: '555-0104' }
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Records Tab */}
        <TabsContent value="health-records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Records</CardTitle>
                  <CardDescription>Complete health documentation</CardDescription>
                </div>
                {canEdit && (
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Annual Physical Exam', date: 'Mar 1, 2025', type: 'Report', size: '2.4 MB' },
                  { name: 'Blood Work Results', date: 'Feb 28, 2025', type: 'Lab', size: '1.1 MB' },
                  { name: 'Cardiology Report', date: 'Feb 15, 2025', type: 'Specialist', size: '3.2 MB' },
                  { name: 'X-Ray Results', date: 'Jan 20, 2025', type: 'Imaging', size: '5.8 MB' },
                  { name: 'Medication History', date: 'Jan 1, 2025', type: 'Pharmacy', size: '0.8 MB' }
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                      {canEdit && (
                        <Button size="icon" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Information */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Emergency Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="font-medium">O Positive</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p className="font-medium">Penicillin, Shellfish</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">John Doe (Son) - 555-0199</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Advance Directive</p>
                  <p className="font-medium">On File ✓</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}