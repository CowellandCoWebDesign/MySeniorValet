import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { 
  Users, UserPlus, UserCheck, UserX, Clock, Calendar as CalendarIcon,
  Award, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Star, DollarSign, Briefcase, FileText, Download, Upload,
  Phone, Mail, MapPin, Shield, Activity, Target, BarChart3,
  Settings, Filter, Search, RefreshCw, Plus, Edit, Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface StaffManagementProps {
  communityId: number;
}

export function StaffManagement({ communityId }: StaffManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Staff data query
  const { data: staffData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/staff', communityId],
  });

  // Mock staff data - replace with real API data
  const mockStaff = {
    summary: {
      totalStaff: 124,
      activeToday: 42,
      onLeave: 3,
      openPositions: 5,
      avgTenure: 3.2,
      turnoverRate: 12.5,
      overtimeHours: 156,
      trainingCompliance: 94.5
    },
    departments: [
      { name: 'Nursing', count: 45, percentage: 36 },
      { name: 'Care Staff', count: 38, percentage: 31 },
      { name: 'Dining', count: 15, percentage: 12 },
      { name: 'Housekeeping', count: 12, percentage: 10 },
      { name: 'Administration', count: 8, percentage: 6 },
      { name: 'Maintenance', count: 6, percentage: 5 }
    ],
    shifts: {
      day: { scheduled: 45, actual: 43, callouts: 2 },
      evening: { scheduled: 35, actual: 34, callouts: 1 },
      night: { scheduled: 20, actual: 20, callouts: 0 }
    },
    employees: [
      {
        id: 'E001',
        name: 'Sarah Johnson',
        role: 'Registered Nurse',
        department: 'Nursing',
        shift: 'Day',
        status: 'active',
        avatar: null,
        email: 'sarah.j@community.com',
        phone: '555-0201',
        hireDate: '2022-03-15',
        certifications: ['RN', 'CPR', 'Med Admin'],
        nextReview: '2025-09-15',
        performanceScore: 92,
        attendance: 98.5,
        overtimeHours: 12
      },
      {
        id: 'E002',
        name: 'Michael Chen',
        role: 'Care Coordinator',
        department: 'Care Staff',
        shift: 'Day',
        status: 'active',
        avatar: null,
        email: 'michael.c@community.com',
        phone: '555-0202',
        hireDate: '2023-06-20',
        certifications: ['CNA', 'CPR', 'Dementia Care'],
        nextReview: '2025-10-20',
        performanceScore: 88,
        attendance: 96.2,
        overtimeHours: 8
      },
      {
        id: 'E003',
        name: 'Lisa Brown',
        role: 'Dining Services Manager',
        department: 'Dining',
        shift: 'Day',
        status: 'active',
        avatar: null,
        email: 'lisa.b@community.com',
        phone: '555-0203',
        hireDate: '2021-11-08',
        certifications: ['ServSafe', 'Nutrition'],
        nextReview: '2025-11-08',
        performanceScore: 94,
        attendance: 99.1,
        overtimeHours: 4
      },
      {
        id: 'E004',
        name: 'James Wilson',
        role: 'Maintenance Supervisor',
        department: 'Maintenance',
        shift: 'Day',
        status: 'on_leave',
        avatar: null,
        email: 'james.w@community.com',
        phone: '555-0204',
        hireDate: '2020-05-10',
        certifications: ['HVAC', 'Electrical', 'Plumbing'],
        nextReview: '2025-12-10',
        performanceScore: 90,
        attendance: 97.5,
        overtimeHours: 18
      }
    ],
    performance: {
      topPerformers: [
        { name: 'Lisa Brown', score: 94, department: 'Dining' },
        { name: 'Sarah Johnson', score: 92, department: 'Nursing' },
        { name: 'James Wilson', score: 90, department: 'Maintenance' }
      ],
      needsImprovement: [
        { name: 'New Hire 1', score: 72, department: 'Care Staff' },
        { name: 'New Hire 2', score: 75, department: 'Housekeeping' }
      ]
    },
    training: {
      upcoming: [
        { course: 'Annual HIPAA Training', date: '2025-09-05', enrolled: 124 },
        { course: 'CPR Recertification', date: '2025-09-10', enrolled: 85 },
        { course: 'Dementia Care Workshop', date: '2025-09-15', enrolled: 45 },
        { course: 'Fire Safety Drill', date: '2025-09-20', enrolled: 124 }
      ],
      compliance: {
        mandatory: { completed: 117, total: 124 },
        optional: { completed: 68, total: 124 }
      }
    },
    scheduling: {
      nextWeek: {
        understaffed: 3,
        adequatelyStaffed: 18,
        overstaffed: 0
      },
      requests: {
        timeOff: 8,
        shiftSwaps: 4,
        pending: 5
      }
    },
    turnoverTrend: [
      { month: 'Apr', rate: 10.2 },
      { month: 'May', rate: 11.5 },
      { month: 'Jun', rate: 12.1 },
      { month: 'Jul', rate: 12.8 },
      { month: 'Aug', rate: 12.5 }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500">On Leave</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEmployees = mockStaff.employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesShift = selectedShift === 'all' || employee.shift === selectedShift;
    return matchesSearch && matchesDepartment && matchesShift;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Employee scheduling, performance tracking, and workforce analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Roster
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
                <p className="text-2xl font-bold">{mockStaff.summary.totalStaff}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockStaff.summary.activeToday} active today
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Turnover Rate</p>
                <p className="text-2xl font-bold">{mockStaff.summary.turnoverRate}%</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">-0.3% this month</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Training Compliance</p>
                <p className="text-2xl font-bold">{mockStaff.summary.trainingCompliance}%</p>
                <Progress value={mockStaff.summary.trainingCompliance} className="h-1 mt-2" />
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Positions</p>
                <p className="text-2xl font-bold">{mockStaff.summary.openPositions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  3 interviews scheduled
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Staff Tabs */}
      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Roster Tab */}
        <TabsContent value="roster" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search employees by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Nursing">Nursing</SelectItem>
                    <SelectItem value="Care Staff">Care Staff</SelectItem>
                    <SelectItem value="Dining">Dining</SelectItem>
                    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Employee List */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Complete staff roster with contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{employee.name}</p>
                            {getStatusBadge(employee.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.role}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{employee.department}</span>
                            <span>•</span>
                            <span>{employee.shift} Shift</span>
                            <span>•</span>
                            <span>Hired: {employee.hireDate}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{employee.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{employee.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-2 mb-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className={`text-sm font-semibold ${getPerformanceColor(employee.performanceScore)}`}>
                            Performance: {employee.performanceScore}%
                          </p>
                          <p className="text-xs text-gray-500">
                            Attendance: {employee.attendance}%
                          </p>
                        </div>
                      </div>
                    </div>
                    {employee.certifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {employee.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="scheduling" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Shift Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Shift Coverage</CardTitle>
                <CardDescription>Current staffing levels by shift</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Day Shift (7am-3pm)</span>
                      <span className="text-sm">{mockStaff.shifts.day.actual}/{mockStaff.shifts.day.scheduled}</span>
                    </div>
                    <Progress value={(mockStaff.shifts.day.actual / mockStaff.shifts.day.scheduled) * 100} className="h-2" />
                    {mockStaff.shifts.day.callouts > 0 && (
                      <p className="text-xs text-red-500 mt-1">{mockStaff.shifts.day.callouts} callouts</p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Evening Shift (3pm-11pm)</span>
                      <span className="text-sm">{mockStaff.shifts.evening.actual}/{mockStaff.shifts.evening.scheduled}</span>
                    </div>
                    <Progress value={(mockStaff.shifts.evening.actual / mockStaff.shifts.evening.scheduled) * 100} className="h-2" />
                    {mockStaff.shifts.evening.callouts > 0 && (
                      <p className="text-xs text-red-500 mt-1">{mockStaff.shifts.evening.callouts} callouts</p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Night Shift (11pm-7am)</span>
                      <span className="text-sm">{mockStaff.shifts.night.actual}/{mockStaff.shifts.night.scheduled}</span>
                    </div>
                    <Progress value={(mockStaff.shifts.night.actual / mockStaff.shifts.night.scheduled) * 100} className="h-2" />
                    {mockStaff.shifts.night.callouts > 0 && (
                      <p className="text-xs text-red-500 mt-1">{mockStaff.shifts.night.callouts} callouts</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Requests</CardTitle>
                <CardDescription>Pending time-off and shift changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Time Off Requests</span>
                    </div>
                    <Badge>{mockStaff.scheduling.requests.timeOff}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Shift Swaps</span>
                    </div>
                    <Badge>{mockStaff.scheduling.requests.shiftSwaps}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">Pending Approval</span>
                    </div>
                    <Badge variant="destructive">{mockStaff.scheduling.requests.pending}</Badge>
                  </div>
                </div>
                <Button className="w-full mt-4">Review Requests</Button>
              </CardContent>
            </Card>

            {/* Next Week Outlook */}
            <Card>
              <CardHeader>
                <CardTitle>Next Week Outlook</CardTitle>
                <CardDescription>Staffing forecast for upcoming shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Understaffed Shifts</AlertTitle>
                    <AlertDescription>
                      {mockStaff.scheduling.nextWeek.understaffed} shifts need additional coverage
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        {mockStaff.scheduling.nextWeek.adequatelyStaffed}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Adequately Staffed</p>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-center">
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        {mockStaff.scheduling.nextWeek.understaffed}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Understaffed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Calendar</CardTitle>
              <CardDescription>View and manage staff schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{format(selectedDate || new Date(), 'MMMM yyyy')}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Week View</Button>
                  <Button variant="outline" size="sm">Month View</Button>
                  <Button size="sm">Create Schedule</Button>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Employees with highest performance scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStaff.performance.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-sm text-gray-500">{performer.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{performer.score}%</p>
                        <Star className="w-4 h-4 text-yellow-500 inline" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Staff performance by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockStaff.departments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { metric: 'Attendance', Nursing: 98, 'Care Staff': 96, Dining: 99, Housekeeping: 95, Admin: 97, Maintenance: 97 },
                  { metric: 'Productivity', Nursing: 92, 'Care Staff': 89, Dining: 94, Housekeeping: 91, Admin: 88, Maintenance: 90 },
                  { metric: 'Quality', Nursing: 95, 'Care Staff': 93, Dining: 96, Housekeeping: 92, Admin: 94, Maintenance: 93 },
                  { metric: 'Training', Nursing: 94, 'Care Staff': 91, Dining: 93, Housekeeping: 89, Admin: 96, Maintenance: 92 },
                  { metric: 'Satisfaction', Nursing: 90, 'Care Staff': 88, Dining: 92, Housekeeping: 87, Admin: 91, Maintenance: 89 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[80, 100]} />
                  <Radar name="Nursing" dataKey="Nursing" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Radar name="Care Staff" dataKey="Care Staff" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Training Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Training Compliance</CardTitle>
                <CardDescription>Mandatory and optional training completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Mandatory Training</span>
                      <span className="text-sm font-bold">
                        {mockStaff.training.compliance.mandatory.completed}/{mockStaff.training.compliance.mandatory.total}
                      </span>
                    </div>
                    <Progress 
                      value={(mockStaff.training.compliance.mandatory.completed / mockStaff.training.compliance.mandatory.total) * 100} 
                      className="h-3" 
                    />
                    <p className="text-xs text-gray-500 mt-1">94.4% compliance rate</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Optional Training</span>
                      <span className="text-sm font-bold">
                        {mockStaff.training.compliance.optional.completed}/{mockStaff.training.compliance.optional.total}
                      </span>
                    </div>
                    <Progress 
                      value={(mockStaff.training.compliance.optional.completed / mockStaff.training.compliance.optional.total) * 100} 
                      className="h-3" 
                    />
                    <p className="text-xs text-gray-500 mt-1">54.8% participation rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Training */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Training Sessions</CardTitle>
                <CardDescription>Scheduled training and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStaff.training.upcoming.map((training, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{training.course}</p>
                        <p className="text-xs text-gray-500">{training.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge>{training.enrolled} enrolled</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Training
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Training Records */}
          <Card>
            <CardHeader>
              <CardTitle>Training Records</CardTitle>
              <CardDescription>Individual training history and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search employee..." className="w-64" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Training</SelectItem>
                      <SelectItem value="mandatory">Mandatory Only</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Records
                </Button>
              </div>
              <div className="text-sm text-gray-500 text-center py-8">
                Select an employee to view their training records
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Turnover Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Turnover Rate Trend</CardTitle>
                <CardDescription>Monthly staff turnover percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockStaff.turnoverTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <Alert className="mt-4">
                  <TrendingDown className="h-4 w-4" />
                  <AlertTitle>Improving Trend</AlertTitle>
                  <AlertDescription>
                    Turnover rate decreased by 0.3% this month
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Distribution</CardTitle>
                <CardDescription>Employees by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={mockStaff.departments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockStaff.departments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Workforce Key Performance Indicators</CardTitle>
              <CardDescription>Essential HR metrics and benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-blue-600">{mockStaff.summary.avgTenure}</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Tenure (years)</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-green-600">0.62</p>
                  <p className="text-sm text-gray-600 mt-1">Staff to Resident Ratio</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-purple-600">{mockStaff.summary.overtimeHours}</p>
                  <p className="text-sm text-gray-600 mt-1">Overtime Hours</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-amber-600">8.2</p>
                  <p className="text-sm text-gray-600 mt-1">Satisfaction Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}