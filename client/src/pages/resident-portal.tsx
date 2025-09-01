import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Home, Calendar, Heart, Users, MessageSquare, Bell, 
  Activity, Pill, FileText, Camera, Video, Phone,
  MapPin, Clock, ChevronRight, Star, Gift, Smile,
  Shield, Wallet, Settings, Send, Paperclip, AlertCircle
} from 'lucide-react';
import { ProfessionalNavbar } from '@/components/ProfessionalNavbar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Phase 5 Resident Portal
 * Complete resident and family engagement platform
 * 
 * Features:
 * - Resident profiles and care plans
 * - Family member access and permissions
 * - Health tracking and vitals monitoring
 * - Activity calendar and event registration
 * - Medication management
 * - Meal preferences and dietary tracking
 * - Communication hub (messaging, video calls)
 * - Document sharing and storage
 * - Billing and payment portal
 * - Emergency contacts and alerts
 */

interface Resident {
  id: string;
  name: string;
  room: string;
  careLevel: string;
  profilePhoto: string;
  admissionDate: string;
  primaryContact: string;
  emergencyContact: string;
  physician: string;
  allergies: string[];
  medications: Medication[];
  dietaryRestrictions: string[];
  activities: string[];
  mobilityStatus: string;
  cognitiveStatus: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
}

interface HealthVital {
  date: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar?: number;
  oxygenLevel: number;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  description: string;
  category: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  permissions: string[];
  lastVisit?: string;
  profilePhoto?: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  category: string;
}

export default function ResidentPortal() {
  const [selectedResident, setSelectedResident] = useState<string>('1');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState('');
  const { toast } = useToast();
  
  // Fetch resident data
  const { data: resident } = useQuery<Resident>({
    queryKey: ['/api/residents', selectedResident],
    enabled: !!selectedResident,
    initialData: {
      id: '1',
      name: 'Margaret Thompson',
      room: 'Suite 203',
      careLevel: 'Assisted Living',
      profilePhoto: '/api/placeholder/80/80',
      admissionDate: '2024-03-15',
      primaryContact: 'Sarah Thompson (Daughter)',
      emergencyContact: 'John Thompson - 555-0123',
      physician: 'Dr. Emily Chen',
      allergies: ['Penicillin', 'Shellfish'],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Daily',
          time: '8:00 AM',
          prescribedBy: 'Dr. Chen',
          startDate: '2024-03-20'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          time: '8:00 AM, 6:00 PM',
          prescribedBy: 'Dr. Chen',
          startDate: '2024-03-20'
        }
      ],
      dietaryRestrictions: ['Low sodium', 'Diabetic friendly'],
      activities: ['Chair Yoga', 'Book Club', 'Gardening'],
      mobilityStatus: 'Walker assisted',
      cognitiveStatus: 'Mild cognitive impairment'
    }
  });
  
  // Fetch health vitals
  const { data: vitals } = useQuery<HealthVital[]>({
    queryKey: ['/api/residents', selectedResident, 'vitals'],
    enabled: !!selectedResident,
    initialData: [
      {
        date: '2025-08-31',
        bloodPressure: '128/82',
        heartRate: 72,
        temperature: 98.6,
        weight: 145,
        bloodSugar: 110,
        oxygenLevel: 97
      },
      {
        date: '2025-08-30',
        bloodPressure: '130/85',
        heartRate: 75,
        temperature: 98.4,
        weight: 145,
        bloodSugar: 105,
        oxygenLevel: 96
      },
      {
        date: '2025-08-29',
        bloodPressure: '126/80',
        heartRate: 70,
        temperature: 98.7,
        weight: 144,
        bloodSugar: 108,
        oxygenLevel: 97
      }
    ]
  });
  
  // Fetch activities
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    initialData: [
      {
        id: '1',
        title: 'Morning Stretch & Balance',
        type: 'Exercise',
        date: '2025-09-01',
        time: '9:00 AM',
        location: 'Wellness Center',
        instructor: 'Jennifer Mills',
        capacity: 20,
        enrolled: 15,
        description: 'Gentle stretching and balance exercises',
        category: 'Physical Wellness'
      },
      {
        id: '2',
        title: 'Watercolor Painting',
        type: 'Art',
        date: '2025-09-01',
        time: '2:00 PM',
        location: 'Art Studio',
        instructor: 'Robert Lee',
        capacity: 12,
        enrolled: 10,
        description: 'Learn basic watercolor techniques',
        category: 'Creative Arts'
      },
      {
        id: '3',
        title: 'Live Piano Performance',
        type: 'Entertainment',
        date: '2025-09-02',
        time: '3:00 PM',
        location: 'Main Lounge',
        instructor: 'Guest Performer',
        capacity: 50,
        enrolled: 35,
        description: 'Classical piano concert',
        category: 'Entertainment'
      },
      {
        id: '4',
        title: 'Memory Café',
        type: 'Cognitive',
        date: '2025-09-03',
        time: '10:00 AM',
        location: 'Memory Care Unit',
        instructor: 'Dr. Patricia Wong',
        capacity: 15,
        enrolled: 12,
        description: 'Social gathering with memory exercises',
        category: 'Cognitive Health'
      }
    ]
  });
  
  // Fetch family members
  const { data: familyMembers } = useQuery<FamilyMember[]>({
    queryKey: ['/api/residents', selectedResident, 'family'],
    enabled: !!selectedResident,
    initialData: [
      {
        id: '1',
        name: 'Sarah Thompson',
        relationship: 'Daughter',
        email: 'sarah.t@email.com',
        phone: '555-0123',
        permissions: ['view_health', 'view_activities', 'messaging', 'billing'],
        lastVisit: '2025-08-28'
      },
      {
        id: '2',
        name: 'John Thompson',
        relationship: 'Son',
        email: 'john.t@email.com',
        phone: '555-0124',
        permissions: ['view_health', 'view_activities', 'messaging'],
        lastVisit: '2025-08-25'
      },
      {
        id: '3',
        name: 'Emily Thompson',
        relationship: 'Granddaughter',
        email: 'emily.t@email.com',
        phone: '555-0125',
        permissions: ['view_activities', 'messaging'],
        lastVisit: '2025-08-30'
      }
    ]
  });
  
  // Fetch messages
  const { data: messages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    initialData: [
      {
        id: '1',
        from: 'Care Team',
        to: 'Family',
        subject: 'Monthly Care Update',
        content: 'Margaret had a wonderful month participating in activities...',
        timestamp: '2025-08-31 10:30 AM',
        read: false
      },
      {
        id: '2',
        from: 'Activities Director',
        to: 'Family',
        subject: 'Upcoming Birthday Celebration',
        content: 'We\'re planning a special celebration for Margaret\'s birthday...',
        timestamp: '2025-08-30 2:15 PM',
        read: true
      },
      {
        id: '3',
        from: 'Nursing',
        to: 'Sarah Thompson',
        subject: 'Medication Update',
        content: 'Dr. Chen has adjusted Margaret\'s medication dosage...',
        timestamp: '2025-08-29 9:00 AM',
        read: true
      }
    ]
  });
  
  // Fetch documents
  const { data: documents } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    initialData: [
      {
        id: '1',
        name: 'Care Plan - August 2025',
        type: 'PDF',
        uploadedBy: 'Care Team',
        uploadedDate: '2025-08-01',
        size: '245 KB',
        category: 'Care Plans'
      },
      {
        id: '2',
        name: 'Lab Results - July 2025',
        type: 'PDF',
        uploadedBy: 'Dr. Chen',
        uploadedDate: '2025-07-28',
        size: '180 KB',
        category: 'Medical Records'
      },
      {
        id: '3',
        name: 'Monthly Invoice - August',
        type: 'PDF',
        uploadedBy: 'Billing',
        uploadedDate: '2025-08-01',
        size: '120 KB',
        category: 'Billing'
      }
    ]
  });
  
  // Health score calculation
  const healthScore = 85;
  const healthData = [{ name: 'Health', value: healthScore, fill: '#10B981' }];
  
  // Vitals trend data
  const vitalsChartData = vitals?.map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    heartRate: v.heartRate,
    oxygen: v.oxygenLevel,
    bloodSugar: v.bloodSugar
  })) || [];
  
  // Activity participation data
  const activityParticipation = [
    { day: 'Mon', activities: 3 },
    { day: 'Tue', activities: 2 },
    { day: 'Wed', activities: 4 },
    { day: 'Thu', activities: 3 },
    { day: 'Fri', activities: 2 },
    { day: 'Sat', activities: 1 },
    { day: 'Sun', activities: 2 }
  ];
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Physical Wellness':
        return <Activity className="h-4 w-4" />;
      case 'Creative Arts':
        return <Camera className="h-4 w-4" />;
      case 'Entertainment':
        return <Star className="h-4 w-4" />;
      case 'Cognitive Health':
        return <Heart className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // API call would go here
      return Promise.resolve(messageData);
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setShowNewMessageModal(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <ProfessionalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Resident Info */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={resident?.profilePhoto} />
                <AvatarFallback>MT</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{resident?.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    {resident?.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    {resident?.careLevel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Admitted {new Date(resident?.admissionDate || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
              <Button size="sm" onClick={() => setShowNewMessageModal(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Health Score</p>
                  <p className="text-2xl font-bold text-green-600">{healthScore}%</p>
                  <p className="text-xs text-gray-500">Excellent</p>
                </div>
                <div className="w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={healthData}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Activities This Week</p>
                  <p className="text-2xl font-bold">17</p>
                  <p className="text-xs text-green-600">+3 from last week</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Medications</p>
                  <p className="text-2xl font-bold">{resident?.medications.length}</p>
                  <p className="text-xs text-gray-500">All on schedule</p>
                </div>
                <Pill className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Next Payment</p>
                  <p className="text-2xl font-bold">$4,250</p>
                  <p className="text-xs text-gray-500">Due Sept 1</p>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Care Team */}
              <Card>
                <CardHeader>
                  <CardTitle>Care Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>EC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Dr. Emily Chen</p>
                        <p className="text-sm text-gray-500">Primary Physician</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>RN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Rachel Nguyen, RN</p>
                        <p className="text-sm text-gray-500">Primary Nurse</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Michael Johnson</p>
                        <p className="text-sm text-gray-500">Care Coordinator</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Medication Review Completed</p>
                          <p className="text-xs text-gray-500">Dr. Chen reviewed medications - no changes needed</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Participated in Morning Exercise</p>
                          <p className="text-xs text-gray-500">Completed 30 minutes of chair yoga</p>
                          <p className="text-xs text-gray-400">This morning</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Family Visit</p>
                          <p className="text-xs text-gray-500">Sarah Thompson visited for 2 hours</p>
                          <p className="text-xs text-gray-400">Yesterday</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Dietary Update</p>
                          <p className="text-xs text-gray-500">Added preference for afternoon fruit snack</p>
                          <p className="text-xs text-gray-400">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Participation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Participation</CardTitle>
                <CardDescription>Number of activities attended each day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityParticipation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activities" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Tracking</CardTitle>
                <CardDescription>Latest readings and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {vitals && vitals[0] && (
                    <>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="h-6 w-6 mx-auto mb-1 text-red-500" />
                        <p className="text-xs text-gray-500">Blood Pressure</p>
                        <p className="font-bold">{vitals[0].bloodPressure}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Heart className="h-6 w-6 mx-auto mb-1 text-pink-500" />
                        <p className="text-xs text-gray-500">Heart Rate</p>
                        <p className="font-bold">{vitals[0].heartRate} bpm</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="font-bold">{vitals[0].temperature}°F</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="font-bold">{vitals[0].weight} lbs</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                        <p className="text-xs text-gray-500">Blood Sugar</p>
                        <p className="font-bold">{vitals[0].bloodSugar} mg/dL</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="h-6 w-6 mx-auto mb-1 text-green-500" />
                        <p className="text-xs text-gray-500">O2 Level</p>
                        <p className="font-bold">{vitals[0].oxygenLevel}%</p>
                      </div>
                    </>
                  )}
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="heartRate" stroke="#EC4899" name="Heart Rate" />
                    <Line type="monotone" dataKey="oxygen" stroke="#10B981" name="Oxygen Level" />
                    <Line type="monotone" dataKey="bloodSugar" stroke="#F59E0B" name="Blood Sugar" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle>Medication Schedule</CardTitle>
                <CardDescription>Current medications and administration times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resident?.medications.map((med, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{med.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                            <div>
                              <p className="text-gray-500">Dosage</p>
                              <p className="font-medium">{med.dosage}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Frequency</p>
                              <p className="font-medium">{med.frequency}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Time</p>
                              <p className="font-medium">{med.time}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Prescribed By</p>
                              <p className="font-medium">{med.prescribedBy}</p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Care Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Care Notes & Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Allergy Alert</AlertTitle>
                    <AlertDescription>
                      {resident?.allergies.join(', ')}
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-1">Dietary Restrictions</p>
                      <p className="text-sm text-gray-600">{resident?.dietaryRestrictions.join(', ')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium mb-1">Mobility Status</p>
                      <p className="text-sm text-gray-600">{resident?.mobilityStatus}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Activity Calendar</CardTitle>
                    <CardDescription>Upcoming events and activities</CardDescription>
                  </div>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities?.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(activity.category)}
                          <div>
                            <h4 className="font-semibold">{activity.title}</h4>
                            <p className="text-sm text-gray-500">{activity.category}</p>
                          </div>
                        </div>
                        <Badge variant={activity.enrolled < activity.capacity ? 'default' : 'secondary'}>
                          {activity.enrolled}/{activity.capacity}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(activity.date).toLocaleDateString()} at {activity.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{activity.instructor}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-3">{activity.description}</p>
                      
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" className="flex-1">
                          Register
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="family" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Family Members</CardTitle>
                    <CardDescription>Authorized family members and their access levels</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {familyMembers?.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.relationship}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                              <span>{member.email}</span>
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {member.lastVisit && (
                            <p className="text-sm text-gray-500 mb-2">
                              Last visit: {new Date(member.lastVisit).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Access Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>Communication with care team and family</CardDescription>
                  </div>
                  <Button onClick={() => setShowNewMessageModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages?.map((message) => (
                    <div 
                      key={message.id} 
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        !message.read ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                            <p className="font-semibold">{message.subject}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>From: {message.from}</span>
                            <span>To: {message.to}</span>
                            <span>{message.timestamp}</span>
                          </div>
                        </div>
                        {message.attachments && (
                          <Paperclip className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Medical records, care plans, and important documents</CardDescription>
                  </div>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{doc.category}</span>
                            <span>{doc.size}</span>
                            <span>Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                            <span>by {doc.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Payments</CardTitle>
                <CardDescription>Account balance and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                    <p className="text-2xl font-bold">$0.00</p>
                    <p className="text-xs text-green-600">Paid in full</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Next Payment Due</p>
                    <p className="text-2xl font-bold">$4,250</p>
                    <p className="text-xs text-gray-500">September 1, 2025</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Auto-Pay Status</p>
                    <p className="text-lg font-bold text-green-600">Enabled</p>
                    <p className="text-xs text-gray-500">Card ending in 4242</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Recent Transactions</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left p-3 text-sm">Date</th>
                          <th className="text-left p-3 text-sm">Description</th>
                          <th className="text-right p-3 text-sm">Amount</th>
                          <th className="text-center p-3 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3 text-sm">Aug 1, 2025</td>
                          <td className="p-3 text-sm">Monthly Room & Care</td>
                          <td className="p-3 text-sm text-right">$4,250.00</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-green-600">Paid</Badge>
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3 text-sm">Jul 1, 2025</td>
                          <td className="p-3 text-sm">Monthly Room & Care</td>
                          <td className="p-3 text-sm text-right">$4,250.00</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-green-600">Paid</Badge>
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3 text-sm">Jun 15, 2025</td>
                          <td className="p-3 text-sm">Physical Therapy (8 sessions)</td>
                          <td className="p-3 text-sm text-right">$640.00</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-green-600">Paid</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button>Make Payment</Button>
                  <Button variant="outline">Download Statement</Button>
                  <Button variant="outline">Payment Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}