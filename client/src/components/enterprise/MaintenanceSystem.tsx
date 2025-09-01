import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, Calendar as CalendarIcon,
  Package, Truck, DollarSign, TrendingUp, TrendingDown, AlertCircle,
  Home, Filter, Search, Plus, Download, Upload, Settings,
  Building, FileText, User, MapPin, Phone, Mail, Activity,
  ThermometerSun, Zap, Droplets, Wind, Shield, Timer
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area } from 'recharts';

interface MaintenanceSystemProps {
  communityId: number;
}

export function MaintenanceSystem({ communityId }: MaintenanceSystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Maintenance data query
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/maintenance', communityId],
  });

  // Mock maintenance data - replace with real API data
  const mockMaintenance = {
    summary: {
      openRequests: 47,
      inProgress: 18,
      completedThisWeek: 32,
      avgResolutionTime: 4.2,
      emergencyRequests: 3,
      preventiveTasks: 12,
      overdueRequests: 5,
      complianceRate: 96.5
    },
    requestsByCategory: [
      { category: 'HVAC', count: 18, percentage: 25 },
      { category: 'Plumbing', count: 15, percentage: 21 },
      { category: 'Electrical', count: 12, percentage: 17 },
      { category: 'General Repairs', count: 10, percentage: 14 },
      { category: 'Grounds', count: 8, percentage: 11 },
      { category: 'Safety', count: 5, percentage: 7 },
      { category: 'Other', count: 4, percentage: 5 }
    ],
    workOrders: [
      {
        id: 'WO-001',
        title: 'AC Unit Not Cooling - Room 204',
        category: 'HVAC',
        priority: 'high',
        status: 'in_progress',
        requestedBy: 'Margaret Thompson',
        assignedTo: 'John Martinez',
        location: 'Room 204A',
        createdAt: '2025-08-28T10:00:00',
        expectedCompletion: '2025-09-01T16:00:00',
        description: 'Resident reports AC unit running but not cooling properly',
        cost: 0
      },
      {
        id: 'WO-002',
        title: 'Leaking Faucet - Kitchen',
        category: 'Plumbing',
        priority: 'medium',
        status: 'open',
        requestedBy: 'Dining Staff',
        assignedTo: null,
        location: 'Main Kitchen',
        createdAt: '2025-08-29T08:30:00',
        expectedCompletion: null,
        description: 'Kitchen sink faucet dripping continuously',
        cost: 0
      },
      {
        id: 'WO-003',
        title: 'Emergency Exit Light Out',
        category: 'Safety',
        priority: 'emergency',
        status: 'in_progress',
        requestedBy: 'Security',
        assignedTo: 'Mike Wilson',
        location: 'Building B - 2nd Floor',
        createdAt: '2025-08-29T14:00:00',
        expectedCompletion: '2025-08-29T18:00:00',
        description: 'Emergency exit sign not illuminated - safety violation',
        cost: 85
      },
      {
        id: 'WO-004',
        title: 'Elevator Preventive Maintenance',
        category: 'Safety',
        priority: 'low',
        status: 'scheduled',
        requestedBy: 'System',
        assignedTo: 'External Vendor',
        location: 'Main Building',
        createdAt: '2025-08-25T00:00:00',
        expectedCompletion: '2025-09-05T09:00:00',
        description: 'Quarterly elevator inspection and maintenance',
        cost: 1200
      }
    ],
    assets: [
      { name: 'HVAC System', status: 'operational', lastService: '2025-07-15', nextService: '2025-10-15', age: 5 },
      { name: 'Generator', status: 'operational', lastService: '2025-08-01', nextService: '2025-09-01', age: 3 },
      { name: 'Elevators (2)', status: 'needs_service', lastService: '2025-06-01', nextService: '2025-09-05', age: 12 },
      { name: 'Fire System', status: 'operational', lastService: '2025-08-20', nextService: '2025-09-20', age: 8 },
      { name: 'Kitchen Equipment', status: 'operational', lastService: '2025-07-25', nextService: '2025-10-25', age: 6 }
    ],
    vendors: [
      { name: 'HVAC Solutions Inc', specialty: 'HVAC', rating: 4.8, jobs: 45, avgResponse: '2h' },
      { name: 'Pro Plumbing Services', specialty: 'Plumbing', rating: 4.5, jobs: 38, avgResponse: '1h' },
      { name: 'Elite Electrical', specialty: 'Electrical', rating: 4.9, jobs: 29, avgResponse: '3h' },
      { name: 'Otis Elevators', specialty: 'Elevators', rating: 4.7, jobs: 12, avgResponse: '4h' }
    ],
    costTrend: [
      { month: 'Apr', cost: 8500, budget: 10000 },
      { month: 'May', cost: 9200, budget: 10000 },
      { month: 'Jun', cost: 11500, budget: 10000 },
      { month: 'Jul', cost: 9800, budget: 10000 },
      { month: 'Aug', cost: 8900, budget: 10000 }
    ],
    responseTime: [
      { priority: 'Emergency', target: 1, actual: 0.8 },
      { priority: 'High', target: 4, actual: 3.5 },
      { priority: 'Medium', target: 24, actual: 18 },
      { priority: 'Low', target: 72, actual: 48 }
    ],
    preventiveMaintenance: {
      scheduled: 28,
      completed: 24,
      overdue: 2,
      upcoming: 4
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge className="bg-red-500">Emergency</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-500">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HVAC':
        return <ThermometerSun className="w-4 h-4" />;
      case 'Plumbing':
        return <Droplets className="w-4 h-4" />;
      case 'Electrical':
        return <Zap className="w-4 h-4" />;
      case 'Safety':
        return <Shield className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const filteredWorkOrders = mockMaintenance.workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Work orders, preventive maintenance, and facility management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Emergency</p>
                <p className="text-2xl font-bold text-red-600">{mockMaintenance.summary.emergencyRequests}</p>
                <p className="text-xs text-gray-500 mt-1">Requires immediate action</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Requests</p>
                <p className="text-2xl font-bold text-orange-600">{mockMaintenance.summary.openRequests}</p>
                <p className="text-xs text-gray-500 mt-1">{mockMaintenance.summary.overdueRequests} overdue</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{mockMaintenance.summary.inProgress}</p>
                <p className="text-xs text-gray-500 mt-1">Actively being worked on</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{mockMaintenance.summary.completedThisWeek}</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Maintenance Tabs */}
      <Tabs defaultValue="workorders" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="preventive">Preventive</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="workorders" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search work orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Work Orders List */}
          <div className="space-y-3">
            {filteredWorkOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        order.priority === 'emergency' ? 'bg-red-100 dark:bg-red-900/30' :
                        order.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        order.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {getCategoryIcon(order.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{order.title}</p>
                          {getPriorityBadge(order.priority)}
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{order.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.location}
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {order.requestedBy}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                          </span>
                          {order.cost > 0 && (
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${order.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Work Order #{order.id}</p>
                      {order.assignedTo ? (
                        <p className="text-sm font-medium">{order.assignedTo}</p>
                      ) : (
                        <Button size="sm" variant="outline">Assign</Button>
                      )}
                      {order.expectedCompletion && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {format(new Date(order.expectedCompletion), 'MMM d')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Preventive Maintenance Tab */}
        <TabsContent value="preventive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Preventive Maintenance Status */}
            <Card>
              <CardHeader>
                <CardTitle>PM Compliance</CardTitle>
                <CardDescription>Preventive maintenance schedule adherence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Scheduled</span>
                    <span className="font-bold">{mockMaintenance.preventiveMaintenance.scheduled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <span className="font-bold text-green-600">{mockMaintenance.preventiveMaintenance.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Overdue</span>
                    <span className="font-bold text-red-600">{mockMaintenance.preventiveMaintenance.overdue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Upcoming</span>
                    <span className="font-bold text-blue-600">{mockMaintenance.preventiveMaintenance.upcoming}</span>
                  </div>
                </div>
                <Progress value={85.7} className="mt-4" />
                <p className="text-sm text-gray-500 mt-2">85.7% on-time completion rate</p>
              </CardContent>
            </Card>

            {/* Upcoming PM Tasks */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Preventive Maintenance</CardTitle>
                <CardDescription>Scheduled maintenance for next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { task: 'Generator Monthly Test', date: 'Sep 1', asset: 'Generator', vendor: 'Internal' },
                    { task: 'Elevator Quarterly Inspection', date: 'Sep 5', asset: 'Elevators', vendor: 'Otis' },
                    { task: 'Fire System Test', date: 'Sep 20', asset: 'Fire System', vendor: 'Fire Safety Inc' },
                    { task: 'HVAC Filter Replacement', date: 'Sep 25', asset: 'HVAC System', vendor: 'Internal' }
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{task.task}</p>
                        <p className="text-xs text-gray-500">{task.asset} • {task.vendor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{task.date}</p>
                        <Button size="sm" variant="outline" className="mt-1">Schedule</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PM Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Calendar</CardTitle>
              <CardDescription>View and schedule preventive maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          {/* Asset Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {mockMaintenance.assets.map((asset, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Building className="w-5 h-5 text-gray-500" />
                    <Badge variant={asset.status === 'operational' ? 'default' : 'destructive'}>
                      {asset.status === 'operational' ? 'OK' : 'Service'}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-1">{asset.name}</p>
                  <p className="text-xs text-gray-500">Age: {asset.age} years</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs">
                      <span className="text-gray-500">Last: </span>
                      {format(new Date(asset.lastService), 'MMM d')}
                    </p>
                    <p className="text-xs">
                      <span className="text-gray-500">Next: </span>
                      {format(new Date(asset.nextService), 'MMM d')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Asset Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>Track and manage facility equipment and systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Service History
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Inventory
                </Button>
                <Button variant="outline" className="justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          {/* Vendor List */}
          <Card>
            <CardHeader>
              <CardTitle>Preferred Vendors</CardTitle>
              <CardDescription>Trusted service providers and contractors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMaintenance.vendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Truck className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{vendor.name}</p>
                        <p className="text-sm text-gray-500">{vendor.specialty}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs">
                            ⭐ {vendor.rating} rating
                          </span>
                          <span className="text-xs text-gray-500">
                            {vendor.jobs} jobs completed
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Avg Response</p>
                      <p className="text-lg font-bold text-blue-600">{vendor.avgResponse}</p>
                      <Button size="sm" className="mt-2">Contact</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Metrics</CardTitle>
              <CardDescription>Quality and reliability tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold text-green-600">4.7</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Rating</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold text-blue-600">2.5h</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Response</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold text-purple-600">92%</p>
                  <p className="text-sm text-gray-600 mt-1">On-Time Rate</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-2xl font-bold text-amber-600">3.2%</p>
                  <p className="text-sm text-gray-600 mt-1">Callback Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost Analysis</CardTitle>
                <CardDescription>Monthly costs vs budget</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockMaintenance.costTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="budget" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="cost" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Performance</CardTitle>
                <CardDescription>Actual vs target response times (hours)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockMaintenance.responseTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" fill="#94a3b8" />
                    <Bar dataKey="actual" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Work Orders by Category</CardTitle>
              <CardDescription>Distribution of maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={mockMaintenance.requestsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockMaintenance.requestsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {mockMaintenance.requestsByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{
                          backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'][index]
                        }} />
                        <span className="text-sm">{category.category}</span>
                      </div>
                      <span className="font-semibold">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance KPIs</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-green-600">{mockMaintenance.summary.avgResolutionTime}h</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Resolution Time</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-blue-600">{mockMaintenance.summary.complianceRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">Compliance Rate</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-purple-600">86%</p>
                  <p className="text-sm text-gray-600 mt-1">First-Time Fix Rate</p>
                </div>
                <div className="text-center p-3 border rounded">
                  <p className="text-3xl font-bold text-amber-600">$47</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Cost per Request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}