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
import { 
  Users, User, Heart, Brain, Pill, Activity, Calendar,
  Phone, Mail, MapPin, AlertCircle, CheckCircle, Clock,
  FileText, Stethoscope, Shield, TrendingUp, TrendingDown,
  Plus, Search, Filter, Download, Upload, Eye, Edit,
  UserPlus, Bed, Home, Star, MessageSquare, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResidentManagementProps {
  communityId: number;
}

export function ResidentManagement({ communityId }: ResidentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCareType, setFilterCareType] = useState('all');
  const [selectedResident, setSelectedResident] = useState<any>(null);

  // Real residents data from API
  const { data: residentsData, isLoading, refetch } = useQuery({
    queryKey: [`/api/enterprise/residents/${communityId}`, filterCareType],
  });

  // Use real resident data from API with fallbacks
  const residents = residentsData ? {
    summary: {
      total: residentsData.summary?.totalResidents || 0,
      newThisMonth: 0, // Will be calculated from admission dates
      dischargedThisMonth: residentsData.summary?.byStatus?.discharged || 0,
      averageAge: residentsData.summary?.avgAge || 0,
      averageStayMonths: 0, // Will be calculated from admission dates
      occupancyRate: residentsData.summary?.occupancyRate || 0,
      byStatus: residentsData.summary?.byStatus || {},
      byCareLevel: residentsData.summary?.byCareLevel || {}
    },
    careTypeDistribution: [
      { 
        type: 'Independent Living', 
        count: residentsData.summary?.byCareLevel?.independent || 0, 
        percentage: residentsData.summary?.totalResidents > 0 
          ? Math.round((residentsData.summary.byCareLevel.independent / residentsData.summary.totalResidents) * 100) 
          : 0 
      },
      { 
        type: 'Assisted Living', 
        count: residentsData.summary?.byCareLevel?.assisted || 0, 
        percentage: residentsData.summary?.totalResidents > 0 
          ? Math.round((residentsData.summary.byCareLevel.assisted / residentsData.summary.totalResidents) * 100) 
          : 0 
      },
      { 
        type: 'Memory Care', 
        count: residentsData.summary?.byCareLevel?.memoryCare || 0, 
        percentage: residentsData.summary?.totalResidents > 0 
          ? Math.round((residentsData.summary.byCareLevel.memoryCare / residentsData.summary.totalResidents) * 100) 
          : 0 
      },
      { 
        type: 'Skilled Nursing', 
        count: residentsData.summary?.byCareLevel?.skilled || 0, 
        percentage: residentsData.summary?.totalResidents > 0 
          ? Math.round((residentsData.summary.byCareLevel.skilled / residentsData.summary.totalResidents) * 100) 
          : 0 
      }
    ],
    healthStatus: {
      stable: residentsData.summary?.byStatus?.active || 0,
      monitoring: 0, // Will be calculated from health data
      critical: 0 // Will be calculated from health data
    },
    residents: residentsData.residents?.map(r => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`,
      age: r.dateOfBirth ? new Date().getFullYear() - new Date(r.dateOfBirth).getFullYear() : 0,
      room: r.roomNumber || 'N/A',
      careType: r.careLevel,
      admissionDate: r.admissionDate,
      status: r.status === 'active' ? 'stable' : r.status,
      avatar: r.photoUrl,
      primaryContact: r.emergencyContact || 'N/A',
      contactPhone: r.emergencyPhone || 'N/A',
      medications: r.medications?.length || 0,
      allergies: r.allergies || [],
      mobility: r.mobilityLevel || 'Unknown',
      dietRestrictions: r.dietaryRestrictions || [],
      lastAssessment: null,
      nextAssessment: null,
      alerts: [],
      paymentSource: r.paymentSource,
      monthlyRate: r.monthlyRate,
      specialNeeds: r.specialNeeds
    })) || []
  } : {
    // Fallback structure when no data
    summary: {
      total: 0,
      newThisMonth: 0,
      dischargedThisMonth: 0,
      averageAge: 0,
      averageStayMonths: 0,
      occupancyRate: 0
    },
    careTypeDistribution: [
      { type: 'Independent Living', count: 0, percentage: 0 },
      { type: 'Assisted Living', count: 0, percentage: 0 },
      { type: 'Memory Care', count: 0, percentage: 0 },
      { type: 'Skilled Nursing', count: 0, percentage: 0 }
    ],
    healthStatus: {
      stable: 0,
      monitoring: 0,
      critical: 0
    },
    residents: [],
    carePlans: {
      upToDate: 0,
      needsReview: 0,
      overdue: 0
    },
    assessments: {
      completed: 0,
      scheduled: 0,
      overdue: 0
    },
    incidents: [],
    acuityTrend: []
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable':
        return <Badge className="bg-green-500">Stable</Badge>;
      case 'monitoring':
        return <Badge className="bg-yellow-500">Monitoring</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMobilityIcon = (mobility: string) => {
    switch (mobility) {
      case 'Independent':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'Walker':
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'Wheelchair':
        return <Heart className="w-4 h-4 text-orange-500" />;
      case 'Bedbound':
        return <Bed className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredResidents = residents.residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCareType === 'all' || resident.careType === filterCareType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resident Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive resident care tracking and health management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Roster
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Residents</p>
                <p className="text-2xl font-bold">{residents.summary.total}</p>
              </div>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">New Admits</p>
                <p className="text-2xl font-bold">+{residents.summary.newThisMonth}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Age</p>
                <p className="text-2xl font-bold">{residents.summary.averageAge}</p>
              </div>
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stable</p>
                <p className="text-2xl font-bold">{residents.healthStatus.stable}</p>
              </div>
              <Heart className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitoring</p>
                <p className="text-2xl font-bold">{residents.healthStatus.monitoring}</p>
              </div>
              <Activity className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold">{residents.healthStatus.critical}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Resident Tabs */}
      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="careplans">Care Plans</TabsTrigger>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
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
                    placeholder="Search residents by name or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCareType} onValueChange={setFilterCareType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Care Types</SelectItem>
                    <SelectItem value="Independent Living">Independent Living</SelectItem>
                    <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                    <SelectItem value="Memory Care">Memory Care</SelectItem>
                    <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resident List */}
          <Card>
            <CardHeader>
              <CardTitle>Resident Directory</CardTitle>
              <CardDescription>Complete list of current residents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredResidents.map((resident) => (
                  <div key={resident.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                       onClick={() => setSelectedResident(resident)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={resident.avatar} />
                          <AvatarFallback>{resident.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{resident.name}</p>
                            {getStatusBadge(resident.status)}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Age: {resident.age}</span>
                            <span>Room: {resident.room}</span>
                            <span>{resident.careType}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Pill className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{resident.medications} meds</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getMobilityIcon(resident.mobility)}
                              <span className="text-sm">{resident.mobility}</span>
                            </div>
                            {resident.alerts.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-yellow-600">{resident.alerts.length} alerts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Admitted: {resident.admissionDate}</p>
                        </div>
                      </div>
                    </div>
                    {resident.alerts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resident.alerts.map((alert, index) => (
                          <Badge key={index} variant="outline" className="text-yellow-600">
                            {alert}
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

        {/* Care Plans Tab */}
        <TabsContent value="careplans" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Care Plan Status */}
            <Card>
              <CardHeader>
                <CardTitle>Care Plan Status</CardTitle>
                <CardDescription>Overview of care plan compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Up to Date</span>
                    </div>
                    <span className="text-2xl font-bold">{residents.carePlans.upToDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span>Needs Review</span>
                    </div>
                    <span className="text-2xl font-bold">{residents.carePlans.needsReview}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span>Overdue</span>
                    </div>
                    <span className="text-2xl font-bold">{residents.carePlans.overdue}</span>
                  </div>
                </div>
                <Progress value={92.6} className="mt-4" />
                <p className="text-sm text-gray-500 mt-2">92.6% compliance rate</p>
              </CardContent>
            </Card>

            {/* Care Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Care Type Distribution</CardTitle>
                <CardDescription>Residents by level of care</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={residents.careTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {residents.careTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Care Plan Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>Latest care plan modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { resident: 'Margaret Thompson', update: 'Medication adjustment', date: '2h ago' },
                    { resident: 'Robert Wilson', update: 'Dietary change', date: '5h ago' },
                    { resident: 'Dorothy Chen', update: 'Mobility assessment', date: '1d ago' },
                    { resident: 'James Martinez', update: 'Hospice evaluation', date: '2d ago' }
                  ].map((update, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium text-sm">{update.resident}</p>
                        <p className="text-xs text-gray-500">{update.update}</p>
                      </div>
                      <span className="text-xs text-gray-500">{update.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Plan Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Care Plan Management</CardTitle>
              <CardDescription>Quick actions for care planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
                <Button variant="outline" className="justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Review Queue
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Plans
                </Button>
                <Button variant="outline" className="justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Status Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Health Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Health Alerts</CardTitle>
                <CardDescription>Residents requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Dorothy Chen - Fall Risk</AlertTitle>
                    <AlertDescription>
                      Increased confusion and unsteady gait observed. Implement fall prevention protocol.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>James Martinez - Critical Care</AlertTitle>
                    <AlertDescription>
                      Declining vitals. Family meeting scheduled for hospice discussion.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Robert Wilson - Medication Review</AlertTitle>
                    <AlertDescription>
                      Blood sugar levels unstable. Diabetic medication adjustment needed.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Acuity Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Acuity Level Trend</CardTitle>
                <CardDescription>Changes in resident care needs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={residents.acuityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="low" stackId="a" fill="#10b981" />
                    <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="high" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Health and safety incidents in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {residents.incidents.map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        incident.severity === 'minor' ? 'bg-yellow-100' : 
                        incident.severity === 'moderate' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        <AlertCircle className={`w-4 h-4 ${
                          incident.severity === 'minor' ? 'text-yellow-600' : 
                          incident.severity === 'moderate' ? 'text-orange-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{incident.type}</p>
                        <p className="text-sm text-gray-500">{incident.resident}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{incident.date}</p>
                      <Badge variant={incident.severity === 'minor' ? 'secondary' : 
                                     incident.severity === 'moderate' ? 'default' : 'destructive'}>
                        {incident.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Assessment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Status</CardTitle>
                <CardDescription>Current assessment compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <span className="font-bold text-green-600">{residents.assessments.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scheduled</span>
                    <span className="font-bold text-blue-600">{residents.assessments.scheduled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Overdue</span>
                    <span className="font-bold text-red-600">{residents.assessments.overdue}</span>
                  </div>
                </div>
                <Progress value={98.8} className="mt-4" />
                <p className="text-sm text-gray-500 mt-2">98.8% on-time completion rate</p>
              </CardContent>
            </Card>

            {/* Upcoming Assessments */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>Scheduled assessments for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { resident: 'Dorothy Chen', type: 'Cognitive Assessment', date: 'Sep 1', time: '10:00 AM' },
                    { resident: 'James Martinez', type: 'Pain Assessment', date: 'Sep 4', time: '2:00 PM' },
                    { resident: 'Margaret Thompson', type: 'Fall Risk Assessment', date: 'Sep 15', time: '11:00 AM' }
                  ].map((assessment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{assessment.resident}</p>
                        <p className="text-sm text-gray-500">{assessment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{assessment.date}</p>
                        <p className="text-xs text-gray-500">{assessment.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Length of Stay Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Average Length of Stay</CardTitle>
                <CardDescription>By care type (months)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { type: 'Independent', months: 48 },
                    { type: 'Assisted', months: 36 },
                    { type: 'Memory', months: 24 },
                    { type: 'Skilled', months: 6 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="months" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Satisfaction Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Resident Satisfaction</CardTitle>
                <CardDescription>Monthly satisfaction scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { month: 'Apr', score: 8.9 },
                    { month: 'May', score: 9.0 },
                    { month: 'Jun', score: 9.1 },
                    { month: 'Jul', score: 9.0 },
                    { month: 'Aug', score: 9.2 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[8, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold">9.2</span>
                    <span className="text-sm text-gray-500">/ 10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Resident care quality metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-green-600">98.5%</p>
                  <p className="text-sm text-gray-600 mt-1">Medication Compliance</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-blue-600">2.1</p>
                  <p className="text-sm text-gray-600 mt-1">Falls per 1000 days</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-purple-600">8.5%</p>
                  <p className="text-sm text-gray-600 mt-1">Hospital Readmission</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-amber-600">96%</p>
                  <p className="text-sm text-gray-600 mt-1">Family Satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}