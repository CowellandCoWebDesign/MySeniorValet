import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, Phone, Siren, Activity, Users, Clock, MapPin,
  Shield, AlertCircle, CheckCircle, XCircle, User, Calendar,
  FileText, BarChart3, TrendingUp, TrendingDown, PhoneCall,
  MessageSquare, Bell, Zap, Heart, Ambulance, Fire, Stethoscope,
  Radio, Timer, ChevronRight, Download, Upload, Plus, Search,
  Filter, Eye, Send, RefreshCw, Settings, Info, Target
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area } from 'recharts';

interface EmergencyResponseProps {
  communityId: number;
}

export function EmergencyResponse({ communityId }: EmergencyResponseProps) {
  const [activeIncident, setActiveIncident] = useState<number | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewIncident, setShowNewIncident] = useState(false);

  // Emergency data query
  const { data: emergencyData, isLoading } = useQuery({
    queryKey: ['/api/enterprise/emergency', communityId],
  });

  // Mock emergency response data - replace with real API data
  const mockEmergency = {
    summary: {
      activeIncidents: 2,
      responseTime: 3.2,
      resolvedToday: 5,
      openTickets: 8,
      drillsCompleted: 12,
      complianceScore: 98,
      averageResolution: 18,
      staffTrained: 145
    },
    activeIncidents: [
      {
        id: 1,
        type: 'medical',
        severity: 'high',
        status: 'responding',
        resident: 'John Doe',
        room: '204B',
        description: 'Resident fell in bathroom, conscious but in pain',
        reportedBy: 'Sarah Johnson (CNA)',
        reportedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        responders: ['Dr. Smith', 'Nurse Williams'],
        updates: [
          { time: new Date(Date.now() - 12 * 60 * 1000), message: 'First responder on scene' },
          { time: new Date(Date.now() - 8 * 60 * 1000), message: 'Vital signs stable' },
          { time: new Date(Date.now() - 3 * 60 * 1000), message: 'Awaiting EMS arrival' }
        ],
        vitals: {
          bp: '140/90',
          pulse: 88,
          temp: 98.6,
          o2: 96
        }
      },
      {
        id: 2,
        type: 'fire_alarm',
        severity: 'medium',
        status: 'investigating',
        location: 'Kitchen - East Wing',
        description: 'Smoke detector activation, no visible smoke',
        reportedBy: 'System Alert',
        reportedAt: new Date(Date.now() - 5 * 60 * 1000),
        responders: ['Maintenance Team', 'Security'],
        updates: [
          { time: new Date(Date.now() - 4 * 60 * 1000), message: 'Team dispatched to location' },
          { time: new Date(Date.now() - 2 * 60 * 1000), message: 'Checking all zones' }
        ]
      }
    ],
    recentIncidents: [
      {
        id: 3,
        type: 'medical',
        severity: 'low',
        status: 'resolved',
        description: 'Medication reaction - resolved',
        occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        resolutionTime: 30
      },
      {
        id: 4,
        type: 'security',
        severity: 'medium',
        status: 'resolved',
        description: 'Unauthorized visitor - escorted out',
        occurredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        resolutionTime: 30
      },
      {
        id: 5,
        type: 'facility',
        severity: 'low',
        status: 'resolved',
        description: 'Power outage in North Wing - backup generator activated',
        occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        resolutionTime: 60
      }
    ],
    protocols: [
      {
        id: 'P001',
        name: 'Medical Emergency Response',
        type: 'medical',
        steps: 12,
        lastReviewed: '2025-08-01',
        nextReview: '2025-09-01',
        status: 'current'
      },
      {
        id: 'P002',
        name: 'Fire Evacuation Protocol',
        type: 'fire',
        steps: 18,
        lastReviewed: '2025-07-15',
        nextReview: '2025-10-15',
        status: 'current'
      },
      {
        id: 'P003',
        name: 'Severe Weather Response',
        type: 'weather',
        steps: 15,
        lastReviewed: '2025-08-15',
        nextReview: '2025-09-15',
        status: 'current'
      },
      {
        id: 'P004',
        name: 'Active Threat Protocol',
        type: 'security',
        steps: 20,
        lastReviewed: '2025-06-01',
        nextReview: '2025-09-01',
        status: 'review_pending'
      }
    ],
    drills: {
      scheduled: [
        { type: 'Fire Drill', date: '2025-09-05', shift: 'Day', participants: 45 },
        { type: 'Medical Emergency', date: '2025-09-12', shift: 'Evening', participants: 32 },
        { type: 'Evacuation', date: '2025-09-20', shift: 'Night', participants: 28 }
      ],
      completed: [
        { type: 'Fire Drill', date: '2025-08-15', score: 92, issues: 2 },
        { type: 'Medical Response', date: '2025-08-08', score: 88, issues: 3 },
        { type: 'Severe Weather', date: '2025-07-25', score: 95, issues: 1 }
      ]
    },
    equipment: [
      { item: 'AED Units', total: 8, operational: 8, lastCheck: '2025-08-28', nextCheck: '2025-09-28' },
      { item: 'Fire Extinguishers', total: 24, operational: 23, lastCheck: '2025-08-15', nextCheck: '2025-09-15' },
      { item: 'Emergency Kits', total: 12, operational: 12, lastCheck: '2025-08-20', nextCheck: '2025-09-20' },
      { item: 'Oxygen Tanks', total: 6, operational: 6, lastCheck: '2025-08-25', nextCheck: '2025-09-25' },
      { item: 'Wheelchairs', total: 15, operational: 14, lastCheck: '2025-08-22', nextCheck: '2025-09-22' }
    ],
    contacts: {
      internal: [
        { name: 'Dr. Emily Smith', role: 'Medical Director', phone: '555-0100', available: true },
        { name: 'John Martinez', role: 'Facility Manager', phone: '555-0101', available: true },
        { name: 'Sarah Williams', role: 'Nursing Director', phone: '555-0102', available: false }
      ],
      external: [
        { service: 'Emergency Services', number: '911', responseTime: '3-5 min' },
        { service: 'Local Hospital', number: '555-0200', responseTime: '10 min' },
        { service: 'Fire Department', number: '555-0201', responseTime: '4 min' },
        { service: 'Police', number: '555-0202', responseTime: '5 min' },
        { service: 'Poison Control', number: '1-800-222-1222', responseTime: 'Immediate' }
      ]
    },
    statistics: {
      incidentsByType: [
        { type: 'Medical', count: 42, percentage: 45 },
        { type: 'Falls', count: 28, percentage: 30 },
        { type: 'Fire/Safety', count: 12, percentage: 13 },
        { type: 'Security', count: 8, percentage: 8 },
        { type: 'Other', count: 4, percentage: 4 }
      ],
      responseTimeTrend: [
        { month: 'Apr', avgTime: 4.2 },
        { month: 'May', avgTime: 3.8 },
        { month: 'Jun', avgTime: 3.5 },
        { month: 'Jul', avgTime: 3.3 },
        { month: 'Aug', avgTime: 3.2 }
      ],
      incidentTrend: [
        { month: 'Apr', incidents: 18 },
        { month: 'May', incidents: 15 },
        { month: 'Jun', incidents: 12 },
        { month: 'Jul', incidents: 14 },
        { month: 'Aug', incidents: 11 }
      ]
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'responding':
        return <Badge className="bg-red-500 animate-pulse">Responding</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-500">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'monitoring':
        return <Badge className="bg-blue-500">Monitoring</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'fire_alarm':
      case 'fire':
        return <Fire className="w-5 h-5 text-orange-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'facility':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emergency Response System</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time incident management and emergency protocols
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="destructive" onClick={() => setShowNewIncident(true)}>
            <Siren className="w-4 h-4 mr-2 animate-pulse" />
            Report Emergency
          </Button>
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Emergency Contacts
          </Button>
        </div>
      </div>

      {/* Active Incidents Alert */}
      {mockEmergency.activeIncidents.length > 0 && (
        <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
          <Siren className="h-4 w-4 animate-pulse" />
          <AlertTitle>Active Incidents Requiring Attention</AlertTitle>
          <AlertDescription>
            {mockEmergency.activeIncidents.length} active incident{mockEmergency.activeIncidents.length > 1 ? 's' : ''} in progress. Average response time: {mockEmergency.summary.responseTime} minutes.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={mockEmergency.summary.activeIncidents > 0 ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Incidents</p>
                <p className="text-2xl font-bold">{mockEmergency.summary.activeIncidents}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockEmergency.summary.resolvedToday} resolved today
                </p>
              </div>
              <Siren className={`w-8 h-8 ${mockEmergency.summary.activeIncidents > 0 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold">{mockEmergency.summary.responseTime} min</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">-12% vs last month</span>
                </div>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                <p className="text-2xl font-bold">{mockEmergency.summary.complianceScore}%</p>
                <Progress value={mockEmergency.summary.complianceScore} className="h-1 mt-2" />
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Staff Trained</p>
                <p className="text-2xl font-bold">{mockEmergency.summary.staffTrained}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockEmergency.summary.drillsCompleted} drills completed
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Response Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="drills">Drills</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          {/* Active Incidents */}
          {mockEmergency.activeIncidents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">Active Incidents</h3>
              {mockEmergency.activeIncidents.map((incident) => (
                <Card key={incident.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        {getIncidentIcon(incident.type)}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-lg">{incident.description}</p>
                            {getSeverityBadge(incident.severity)}
                            {getStatusBadge(incident.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {incident.resident && (
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {incident.resident} - Room {incident.room}
                              </span>
                            )}
                            {incident.location && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {incident.location}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(incident.reportedAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>

                    {/* Vital Signs (for medical incidents) */}
                    {incident.vitals && (
                      <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">BP</p>
                          <p className="font-semibold">{incident.vitals.bp}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Pulse</p>
                          <p className="font-semibold">{incident.vitals.pulse}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Temp</p>
                          <p className="font-semibold">{incident.vitals.temp}°F</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">O2</p>
                          <p className="font-semibold">{incident.vitals.o2}%</p>
                        </div>
                      </div>
                    )}

                    {/* Responders */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Ambulance className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Responders:</span>
                        {incident.responders.map((responder, idx) => (
                          <Badge key={idx} variant="outline">{responder}</Badge>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        Reported by: {incident.reportedBy}
                      </span>
                    </div>

                    {/* Updates Timeline */}
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Recent Updates:</p>
                      <div className="space-y-2">
                        {incident.updates.map((update, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm">
                            <span className="text-gray-500 min-w-[60px]">
                              {format(update.time, 'HH:mm')}
                            </span>
                            <ChevronRight className="w-3 h-3 text-gray-400 mt-0.5" />
                            <span>{update.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Resolved incidents from the past 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEmergency.recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {getIncidentIcon(incident.type)}
                      <div>
                        <p className="font-medium">{incident.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{format(incident.occurredAt, 'HH:mm')}</span>
                          <span>Resolution time: {incident.resolutionTime} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Protocols</CardTitle>
              <CardDescription>Standard operating procedures for emergency situations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEmergency.protocols.map((protocol) => (
                  <div key={protocol.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      {getIncidentIcon(protocol.type)}
                      <div>
                        <p className="font-semibold">{protocol.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{protocol.steps} steps</span>
                          <span>Last reviewed: {format(new Date(protocol.lastReviewed), 'MMM d, yyyy')}</span>
                          <span>Next review: {format(new Date(protocol.nextReview), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={protocol.status === 'current' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {protocol.status === 'current' ? 'Current' : 'Review Pending'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drills Tab */}
        <TabsContent value="drills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Scheduled Drills */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Drills</CardTitle>
                <CardDescription>Upcoming emergency preparedness drills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEmergency.drills.scheduled.map((drill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{drill.type}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(drill.date), 'MMM d, yyyy')}
                          </span>
                          <span>{drill.shift} Shift</span>
                          <span>{drill.participants} participants</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Schedule</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Drills */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Drill Performance</CardTitle>
                <CardDescription>Results from completed emergency drills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEmergency.drills.completed.map((drill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{drill.type}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>{format(new Date(drill.date), 'MMM d, yyyy')}</span>
                          <span className={drill.score >= 90 ? 'text-green-600' : drill.score >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                            Score: {drill.score}%
                          </span>
                          <span>{drill.issues} issues found</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View Report</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Equipment Status</CardTitle>
              <CardDescription>Inventory and maintenance schedule for emergency equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Equipment</th>
                      <th className="text-center p-2">Total</th>
                      <th className="text-center p-2">Operational</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Last Check</th>
                      <th className="text-center p-2">Next Check</th>
                      <th className="text-center p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEmergency.equipment.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{item.item}</td>
                        <td className="text-center p-2">{item.total}</td>
                        <td className="text-center p-2">
                          <span className={item.operational === item.total ? 'text-green-600' : 'text-yellow-600'}>
                            {item.operational}
                          </span>
                        </td>
                        <td className="text-center p-2">
                          {item.operational === item.total ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-2 text-sm">
                          {format(new Date(item.lastCheck), 'MMM d')}
                        </td>
                        <td className="text-center p-2 text-sm">
                          {format(new Date(item.nextCheck), 'MMM d')}
                        </td>
                        <td className="text-center p-2">
                          <Button size="sm" variant="outline">Inspect</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Internal Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Internal Emergency Contacts</CardTitle>
                <CardDescription>Key staff members for emergency response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEmergency.contacts.internal.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${contact.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{contact.phone}</span>
                        <Button size="sm" variant="outline">
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* External Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>External Emergency Services</CardTitle>
                <CardDescription>Emergency services and response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEmergency.contacts.external.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-gray-500">Response: {service.responseTime}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-red-600">{service.number}</span>
                        <Button size="sm" variant="destructive">
                          <PhoneCall className="w-4 h-4" />
                        </Button>
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
            {/* Incident Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Type</CardTitle>
                <CardDescription>Distribution of emergency incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={mockEmergency.statistics.incidentsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockEmergency.statistics.incidentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>Average response time in minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockEmergency.statistics.responseTimeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTime" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Incident Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Incident Trend</CardTitle>
              <CardDescription>Number of incidents per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={mockEmergency.statistics.incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">98%</p>
                  <p className="text-sm text-gray-600 mt-1">Compliance Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">3.2 min</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Response</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">145</p>
                  <p className="text-sm text-gray-600 mt-1">Staff Trained</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">12</p>
                  <p className="text-sm text-gray-600 mt-1">Drills Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}