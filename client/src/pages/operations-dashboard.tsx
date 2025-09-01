import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { 
  Users, Calendar as CalendarIcon, Wrench, AlertCircle, Clock, 
  CheckCircle2, XCircle, Activity, TrendingUp, Home, Shield,
  Heart, Brain, Stethoscope, Coffee, Car, Utensils, Bed,
  ChevronRight, Plus, Edit, Trash2, Settings, Filter, Download
} from 'lucide-react';
import { ProfessionalNavbar } from '@/components/ProfessionalNavbar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
 * Phase 5 Operations Dashboard
 * Complete staff management and facility operations system
 * 
 * Features:
 * - Staff scheduling and management
 * - Shift assignments and coverage
 * - Maintenance requests and work orders
 * - Inventory management
 * - Meal planning and dietary management
 * - Transportation scheduling
 * - Facility utilization metrics
 * - Department performance tracking
 * - Emergency response protocols
 * - Quality assurance monitoring
 */

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  shiftType: string;
  status: 'active' | 'on-leave' | 'off-duty';
  hoursThisWeek: number;
  maxHours: number;
  certifications: string[];
  nextShift: string;
  performance: number;
  avatar?: string;
}

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  requiredStaff: number;
  assignedStaff: number;
  staffMembers: string[];
  status: 'fully-staffed' | 'understaffed' | 'overstaffed';
}

interface MaintenanceRequest {
  id: string;
  title: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  reportedBy: string;
  assignedTo?: string;
  reportedDate: string;
  dueDate?: string;
  category: string;
  estimatedCost?: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastOrdered: string;
  supplier: string;
  costPerUnit: number;
  expiryDate?: string;
}

interface MealPlan {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mainDish: string;
  sides: string[];
  dietaryOptions: string[];
  expectedCount: number;
  actualCount?: number;
  cost: number;
  nutritionScore: number;
}

interface TransportRequest {
  id: string;
  resident: string;
  destination: string;
  purpose: string;
  date: string;
  time: string;
  returnTime?: string;
  driver?: string;
  vehicle?: string;
  status: 'scheduled' | 'in-transit' | 'completed' | 'cancelled';
  wheelchairAccessible: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function OperationsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);
  const { toast } = useToast();
  
  // Fetch staff members
  const { data: staff } = useQuery<StaffMember[]>({
    queryKey: ['/api/operations/staff', selectedDepartment],
    initialData: [
      {
        id: '1',
        name: 'Rachel Nguyen',
        role: 'Registered Nurse',
        department: 'Nursing',
        shiftType: 'Day',
        status: 'active',
        hoursThisWeek: 32,
        maxHours: 40,
        certifications: ['RN', 'CPR', 'IV Therapy'],
        nextShift: '7:00 AM - 3:00 PM',
        performance: 95
      },
      {
        id: '2',
        name: 'Michael Johnson',
        role: 'Care Coordinator',
        department: 'Care Services',
        shiftType: 'Day',
        status: 'active',
        hoursThisWeek: 38,
        maxHours: 40,
        certifications: ['CNA', 'CPR', 'Dementia Care'],
        nextShift: '8:00 AM - 4:00 PM',
        performance: 92
      },
      {
        id: '3',
        name: 'Sarah Martinez',
        role: 'LPN',
        department: 'Nursing',
        shiftType: 'Evening',
        status: 'active',
        hoursThisWeek: 24,
        maxHours: 40,
        certifications: ['LPN', 'CPR', 'Medication Admin'],
        nextShift: '3:00 PM - 11:00 PM',
        performance: 88
      },
      {
        id: '4',
        name: 'David Lee',
        role: 'Maintenance Supervisor',
        department: 'Facilities',
        shiftType: 'Day',
        status: 'active',
        hoursThisWeek: 40,
        maxHours: 40,
        certifications: ['HVAC', 'Electrical', 'Plumbing'],
        nextShift: '6:00 AM - 2:00 PM',
        performance: 90
      },
      {
        id: '5',
        name: 'Emily Chen',
        role: 'Activities Director',
        department: 'Activities',
        shiftType: 'Day',
        status: 'on-leave',
        hoursThisWeek: 0,
        maxHours: 40,
        certifications: ['Recreation Therapy', 'CPR'],
        nextShift: 'On Leave',
        performance: 93
      }
    ]
  });
  
  // Fetch shifts
  const { data: shifts } = useQuery<Shift[]>({
    queryKey: ['/api/operations/shifts', selectedDate],
    initialData: [
      {
        id: '1',
        date: '2025-09-01',
        startTime: '7:00 AM',
        endTime: '3:00 PM',
        department: 'Nursing',
        requiredStaff: 8,
        assignedStaff: 7,
        staffMembers: ['Rachel Nguyen', 'Jennifer Mills', 'Tom Wilson'],
        status: 'understaffed'
      },
      {
        id: '2',
        date: '2025-09-01',
        startTime: '3:00 PM',
        endTime: '11:00 PM',
        department: 'Nursing',
        requiredStaff: 6,
        assignedStaff: 6,
        staffMembers: ['Sarah Martinez', 'Lisa Brown', 'John Davis'],
        status: 'fully-staffed'
      },
      {
        id: '3',
        date: '2025-09-01',
        startTime: '11:00 PM',
        endTime: '7:00 AM',
        department: 'Nursing',
        requiredStaff: 4,
        assignedStaff: 4,
        staffMembers: ['Night Staff Team'],
        status: 'fully-staffed'
      }
    ]
  });
  
  // Fetch maintenance requests
  const { data: maintenanceRequests } = useQuery<MaintenanceRequest[]>({
    queryKey: ['/api/operations/maintenance'],
    initialData: [
      {
        id: '1',
        title: 'AC Unit Not Cooling - Room 203',
        location: 'Suite 203',
        priority: 'high',
        status: 'in-progress',
        reportedBy: 'Nursing Staff',
        assignedTo: 'David Lee',
        reportedDate: '2025-08-30',
        dueDate: '2025-09-01',
        category: 'HVAC',
        estimatedCost: 250
      },
      {
        id: '2',
        title: 'Leaking Faucet',
        location: 'Room 115 Bathroom',
        priority: 'medium',
        status: 'pending',
        reportedBy: 'Housekeeping',
        reportedDate: '2025-08-31',
        category: 'Plumbing',
        estimatedCost: 75
      },
      {
        id: '3',
        title: 'Replace Light Bulbs',
        location: 'Main Hallway',
        priority: 'low',
        status: 'pending',
        reportedBy: 'Security',
        reportedDate: '2025-08-31',
        category: 'Electrical',
        estimatedCost: 30
      },
      {
        id: '4',
        title: 'Emergency Exit Door Alarm',
        location: 'West Wing',
        priority: 'emergency',
        status: 'completed',
        reportedBy: 'Security',
        assignedTo: 'David Lee',
        reportedDate: '2025-08-29',
        category: 'Safety',
        estimatedCost: 150
      }
    ]
  });
  
  // Fetch inventory
  const { data: inventory } = useQuery<InventoryItem[]>({
    queryKey: ['/api/operations/inventory'],
    initialData: [
      {
        id: '1',
        name: 'Medical Gloves',
        category: 'Medical Supplies',
        currentStock: 500,
        minStock: 200,
        maxStock: 1000,
        unit: 'boxes',
        lastOrdered: '2025-08-15',
        supplier: 'MedSupply Co',
        costPerUnit: 12.50
      },
      {
        id: '2',
        name: 'Hand Sanitizer',
        category: 'Hygiene',
        currentStock: 45,
        minStock: 50,
        maxStock: 200,
        unit: 'bottles',
        lastOrdered: '2025-08-20',
        supplier: 'CleanPro',
        costPerUnit: 8.75
      },
      {
        id: '3',
        name: 'Adult Diapers',
        category: 'Personal Care',
        currentStock: 320,
        minStock: 100,
        maxStock: 500,
        unit: 'cases',
        lastOrdered: '2025-08-25',
        supplier: 'CareSupplies Inc',
        costPerUnit: 45.00
      },
      {
        id: '4',
        name: 'Cleaning Supplies',
        category: 'Housekeeping',
        currentStock: 75,
        minStock: 30,
        maxStock: 150,
        unit: 'units',
        lastOrdered: '2025-08-28',
        supplier: 'CleanPro',
        costPerUnit: 125.00
      }
    ]
  });
  
  // Fetch meal plans
  const { data: mealPlans } = useQuery<MealPlan[]>({
    queryKey: ['/api/operations/meals', selectedDate],
    initialData: [
      {
        id: '1',
        date: '2025-09-01',
        mealType: 'breakfast',
        mainDish: 'Scrambled Eggs & Toast',
        sides: ['Fresh Fruit', 'Yogurt', 'Orange Juice'],
        dietaryOptions: ['Gluten-Free', 'Diabetic', 'Low Sodium'],
        expectedCount: 125,
        actualCount: 122,
        cost: 625,
        nutritionScore: 88
      },
      {
        id: '2',
        date: '2025-09-01',
        mealType: 'lunch',
        mainDish: 'Grilled Chicken Breast',
        sides: ['Rice Pilaf', 'Green Beans', 'Garden Salad'],
        dietaryOptions: ['Vegetarian Option', 'Pureed', 'Low Fat'],
        expectedCount: 130,
        cost: 910,
        nutritionScore: 92
      },
      {
        id: '3',
        date: '2025-09-01',
        mealType: 'dinner',
        mainDish: 'Pot Roast',
        sides: ['Mashed Potatoes', 'Carrots', 'Dinner Roll'],
        dietaryOptions: ['Mechanical Soft', 'Cardiac', 'Kosher'],
        expectedCount: 128,
        cost: 1024,
        nutritionScore: 90
      }
    ]
  });
  
  // Fetch transport requests
  const { data: transportRequests } = useQuery<TransportRequest[]>({
    queryKey: ['/api/operations/transport', selectedDate],
    initialData: [
      {
        id: '1',
        resident: 'Margaret Thompson',
        destination: 'St. Mary\'s Hospital',
        purpose: 'Medical Appointment',
        date: '2025-09-01',
        time: '10:00 AM',
        returnTime: '12:00 PM',
        driver: 'John Smith',
        vehicle: 'Van 1',
        status: 'scheduled',
        wheelchairAccessible: true
      },
      {
        id: '2',
        resident: 'Robert Johnson',
        destination: 'Eye Care Center',
        purpose: 'Optometry',
        date: '2025-09-01',
        time: '2:00 PM',
        returnTime: '3:30 PM',
        status: 'scheduled',
        wheelchairAccessible: false
      },
      {
        id: '3',
        resident: 'Group Trip (8)',
        destination: 'Shopping Mall',
        purpose: 'Recreation',
        date: '2025-09-02',
        time: '10:00 AM',
        returnTime: '1:00 PM',
        vehicle: 'Bus',
        status: 'scheduled',
        wheelchairAccessible: true
      }
    ]
  });
  
  // Department performance data
  const departmentPerformance = [
    { department: 'Nursing', score: 92, target: 90 },
    { department: 'Dining', score: 88, target: 85 },
    { department: 'Housekeeping', score: 94, target: 90 },
    { department: 'Activities', score: 91, target: 90 },
    { department: 'Maintenance', score: 87, target: 85 },
    { department: 'Administration', score: 93, target: 90 }
  ];
  
  // Staffing levels over time
  const staffingTrends = [
    { time: '6 AM', required: 15, actual: 14 },
    { time: '8 AM', required: 25, actual: 24 },
    { time: '10 AM', required: 30, actual: 29 },
    { time: '12 PM', required: 32, actual: 32 },
    { time: '2 PM', required: 28, actual: 27 },
    { time: '4 PM', required: 26, actual: 26 },
    { time: '6 PM', required: 22, actual: 22 },
    { time: '8 PM', required: 18, actual: 18 },
    { time: '10 PM', required: 12, actual: 12 }
  ];
  
  // Facility utilization
  const facilityUtilization = [
    { area: 'Resident Rooms', utilization: 94, capacity: 150 },
    { area: 'Dining Hall', utilization: 75, capacity: 80 },
    { area: 'Activity Rooms', utilization: 65, capacity: 40 },
    { area: 'Therapy Gym', utilization: 80, capacity: 20 },
    { area: 'Memory Care', utilization: 88, capacity: 30 },
    { area: 'Skilled Nursing', utilization: 92, capacity: 40 }
  ];
  
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      emergency: 'bg-red-100 text-red-700'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };
  
  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: any) => {
      // API call would go here
      return Promise.resolve(shiftData);
    },
    onSuccess: () => {
      toast({
        title: 'Shift Created',
        description: 'New shift has been scheduled successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/operations/shifts'] });
      setShowNewShiftModal(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <ProfessionalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Operations Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Real-time facility management and staff coordination
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="nursing">Nursing</SelectItem>
                  <SelectItem value="dining">Dining</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Staff On Duty</p>
                  <p className="text-2xl font-bold">47/52</p>
                  <p className="text-xs text-yellow-600">5 call-offs</p>
                </div>
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Occupancy</p>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-green-600">141/150 beds</p>
                </div>
                <Home className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Work Orders</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-orange-600">3 urgent</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Meals Served</p>
                  <p className="text-2xl font-bold">380</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <Utensils className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Transports</p>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-blue-600">Scheduled today</p>
                </div>
                <Car className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quality Score</p>
                  <p className="text-2xl font-bold">91%</p>
                  <p className="text-xs text-green-600">Above target</p>
                </div>
                <Shield className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="staffing" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="staffing">Staffing</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="dining">Dining</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="staffing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Current Shifts */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Today's Shifts</CardTitle>
                    <Button size="sm" onClick={() => setShowNewShiftModal(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Shift
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shifts?.map((shift) => (
                      <div key={shift.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{shift.department}</p>
                            <p className="text-sm text-gray-500">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <Badge className={
                            shift.status === 'fully-staffed' 
                              ? 'bg-green-100 text-green-700' 
                              : shift.status === 'understaffed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }>
                            {shift.assignedStaff}/{shift.requiredStaff} Staff
                          </Badge>
                        </div>
                        {shift.status === 'understaffed' && (
                          <Alert className="mt-2 p-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              Need {shift.requiredStaff - shift.assignedStaff} more staff member(s)
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Staff List */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Staff Members</CardTitle>
                    <Badge variant="outline">{staff?.filter(s => s.status === 'active').length} Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {staff?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.role}</p>
                              <p className="text-xs text-gray-400">{member.nextShift}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={member.status === 'active' ? 'default' : 'secondary'}
                              className={member.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                            >
                              {member.status}
                            </Badge>
                            <div className="mt-1">
                              <Progress value={(member.hoursThisWeek / member.maxHours) * 100} className="w-20 h-2" />
                              <p className="text-xs text-gray-500 mt-1">
                                {member.hoursThisWeek}/{member.maxHours}h
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            {/* Staffing Levels Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Staffing Levels Throughout the Day</CardTitle>
                <CardDescription>Required vs Actual staff coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={staffingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="required" stroke="#EF4444" name="Required" strokeWidth={2} />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" name="Actual" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Maintenance Requests</CardTitle>
                    <CardDescription>Active work orders and repairs</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceRequests?.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <h4 className="font-semibold">{request.title}</h4>
                            <p className="text-sm text-gray-500">{request.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline">{request.status}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-medium">{request.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reported By</p>
                          <p className="font-medium">{request.reportedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Assigned To</p>
                          <p className="font-medium">{request.assignedTo || 'Unassigned'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Est. Cost</p>
                          <p className="font-medium">${request.estimatedCost || 'TBD'}</p>
                        </div>
                      </div>
                      
                      {request.dueDate && (
                        <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Reported: {new Date(request.reportedDate).toLocaleDateString()}
                          </span>
                          <span className="text-orange-600 font-medium">
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Stock levels and supply tracking</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Item</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-center py-2">Stock Level</th>
                        <th className="text-right py-2">Unit Cost</th>
                        <th className="text-left py-2">Supplier</th>
                        <th className="text-left py-2">Last Ordered</th>
                        <th className="text-center py-2">Status</th>
                        <th className="text-center py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory?.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3">
                            <p className="font-medium">{item.name}</p>
                          </td>
                          <td className="py-3">{item.category}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-center gap-2">
                              <Progress 
                                value={(item.currentStock / item.maxStock) * 100} 
                                className="w-20 h-2"
                              />
                              <span className="text-sm">
                                {item.currentStock}/{item.maxStock}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right">${item.costPerUnit.toFixed(2)}</td>
                          <td className="py-3">{item.supplier}</td>
                          <td className="py-3">{new Date(item.lastOrdered).toLocaleDateString()}</td>
                          <td className="py-3 text-center">
                            {item.currentStock < item.minStock ? (
                              <Badge className="bg-red-100 text-red-700">Low Stock</Badge>
                            ) : item.currentStock > item.maxStock * 0.8 ? (
                              <Badge className="bg-yellow-100 text-yellow-700">High Stock</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">Optimal</Badge>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex justify-center gap-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {item.currentStock < item.minStock && (
                                <Button size="sm" variant="default">
                                  Order
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dining" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meal Planning & Service</CardTitle>
                <CardDescription>Today's meal schedule and dietary management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mealPlans?.map((meal) => (
                    <div key={meal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {meal.mealType === 'breakfast' && <Coffee className="h-5 w-5 text-yellow-500" />}
                          {meal.mealType === 'lunch' && <Utensils className="h-5 w-5 text-green-500" />}
                          {meal.mealType === 'dinner' && <Utensils className="h-5 w-5 text-blue-500" />}
                          <h4 className="font-semibold capitalize">{meal.mealType}</h4>
                        </div>
                        <Badge variant="outline">
                          {meal.actualCount || meal.expectedCount} servings
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Main Dish</p>
                          <p className="text-sm text-gray-600">{meal.mainDish}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Sides</p>
                          <p className="text-sm text-gray-600">{meal.sides.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Dietary Options</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {meal.dietaryOptions.map((option) => (
                              <Badge key={option} variant="outline" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="font-medium">${meal.cost}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Nutrition</p>
                          <div className="flex items-center gap-1">
                            <Progress value={meal.nutritionScore} className="w-12 h-2" />
                            <span className="font-medium">{meal.nutritionScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transport" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Transportation Schedule</CardTitle>
                    <CardDescription>Medical appointments and resident transport</CardDescription>
                  </div>
                  <Button>
                    <Car className="h-4 w-4 mr-2" />
                    Schedule Transport
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transportRequests?.map((transport) => (
                    <div key={transport.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                          <Car className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transport.resident}</p>
                          <p className="text-sm text-gray-600">{transport.destination}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{transport.time}</span>
                            {transport.returnTime && <span>Return: {transport.returnTime}</span>}
                            <span>{transport.purpose}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={transport.status === 'scheduled' ? 'default' : 'secondary'}>
                          {transport.status}
                        </Badge>
                        {transport.wheelchairAccessible && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              ♿ Accessible
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Quality scores by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#6366F1" />
                      <Bar dataKey="target" fill="#E5E7EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Facility Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle>Facility Utilization</CardTitle>
                  <CardDescription>Space usage across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {facilityUtilization.map((area) => (
                      <div key={area.area}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{area.area}</span>
                          <span className="text-sm text-gray-500">
                            {Math.round(area.utilization * area.capacity / 100)}/{area.capacity}
                          </span>
                        </div>
                        <Progress value={area.utilization} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quality Metrics Alert */}
            <Alert className="border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
              <Brain className="h-4 w-4" />
              <AlertTitle>Operational Insights</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>• Staffing levels are 96% optimal - consider adding 2 CNAs for evening shift coverage</p>
                <p>• Maintenance response time improved by 23% this month</p>
                <p>• Dining satisfaction scores increased to 92% after menu changes</p>
                <p>• Transportation efficiency at 87% - consolidate medical appointments on Tuesdays/Thursdays</p>
                <p>• Inventory optimization saved $3,200 this month through bulk ordering</p>
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader className="bg-red-50 dark:bg-red-900/20">
                <CardTitle className="text-red-700 dark:text-red-400">Emergency Response Protocols</CardTitle>
                <CardDescription>Quick access to emergency procedures and contacts</CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Emergency Contacts
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fire Department</span>
                        <span className="font-mono font-bold">911</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical Emergency</span>
                        <span className="font-mono font-bold">911</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Facility Administrator</span>
                        <span className="font-mono">555-0100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On-Call Physician</span>
                        <span className="font-mono">555-0150</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance Emergency</span>
                        <span className="font-mono">555-0175</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-500" />
                      Emergency Procedures
                    </h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Fire Evacuation Protocol
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Medical Emergency Response
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Power Outage Procedures
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Severe Weather Protocol
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Missing Resident Protocol
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Current Alert Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">All Systems Normal - No Active Emergencies</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last drill: August 15, 2025 - Fire Evacuation (3:42 completion time)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}