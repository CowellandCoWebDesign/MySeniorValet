import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, BellOff, BellRing, Mail, MessageSquare, Phone, Globe, Zap,
  AlertTriangle, CheckCircle, Info, Clock, Send, Pause, Play, Settings,
  Filter, Search, Eye, Volume2, VolumeX, Smartphone, Monitor, Wifi,
  WifiOff, Database, Server, Cloud, AlertCircle, ChevronRight, Plus,
  Edit, Trash2, RefreshCw, Download, Upload, Share2, Users, User,
  MapPin, Copy, DollarSign, Heart, Shield, Star, Link
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RealTimeNotificationsProps {
  communityId: number;
}

export function RealTimeNotifications({ communityId }: RealTimeNotificationsProps) {
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock notification data - replace with real API/WebSocket data
  const mockNotifications = {
    summary: {
      totalSent: 4567,
      todaySent: 234,
      activeAlerts: 12,
      criticalAlerts: 3,
      deliveryRate: 98.5,
      averageResponseTime: '2.3 min',
      activeChannels: 6,
      subscribedUsers: 145
    },
    activeAlerts: [
      {
        id: 1,
        type: 'critical',
        title: 'Emergency: Fall Detected',
        message: 'Fall detected in Room 203 - Immediate assistance required',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        resident: 'Mary Johnson',
        location: 'Room 203',
        status: 'acknowledged',
        respondedBy: 'Sarah Williams',
        responseTime: '45 seconds',
        channel: ['app', 'sms', 'email']
      },
      {
        id: 2,
        type: 'warning',
        title: 'Medication Alert',
        message: 'Medication not administered on schedule for 3 residents',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        affectedCount: 3,
        status: 'pending',
        priority: 'high',
        channel: ['app', 'email']
      },
      {
        id: 3,
        type: 'info',
        title: 'Staff Shortage Alert',
        message: 'Night shift understaffed by 2 caregivers',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        department: 'Nursing',
        shift: 'Night',
        status: 'resolved',
        resolvedBy: 'John Martinez',
        channel: ['app']
      },
      {
        id: 4,
        type: 'critical',
        title: 'System Alert: Database Connection Lost',
        message: 'Primary database connection interrupted - Failover activated',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        system: 'Database',
        status: 'investigating',
        assignedTo: 'IT Team',
        channel: ['app', 'sms', 'slack']
      },
      {
        id: 5,
        type: 'warning',
        title: 'Compliance Deadline',
        message: 'State inspection documentation due in 24 hours',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'in_progress',
        completionRate: 75,
        channel: ['email']
      }
    ],
    channels: [
      {
        id: 'app',
        name: 'In-App Notifications',
        icon: <Bell className="w-4 h-4" />,
        enabled: true,
        subscribers: 145,
        deliveryRate: 100,
        averageDelay: '0 ms',
        lastUsed: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'email',
        name: 'Email',
        icon: <Mail className="w-4 h-4" />,
        enabled: true,
        subscribers: 132,
        deliveryRate: 98.5,
        averageDelay: '1.2 sec',
        lastUsed: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        id: 'sms',
        name: 'SMS Text',
        icon: <Phone className="w-4 h-4" />,
        enabled: true,
        subscribers: 89,
        deliveryRate: 99.2,
        averageDelay: '800 ms',
        lastUsed: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: 'push',
        name: 'Push Notifications',
        icon: <Smartphone className="w-4 h-4" />,
        enabled: true,
        subscribers: 76,
        deliveryRate: 97.8,
        averageDelay: '500 ms',
        lastUsed: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        id: 'slack',
        name: 'Slack',
        icon: <MessageSquare className="w-4 h-4" />,
        enabled: true,
        subscribers: 45,
        deliveryRate: 99.9,
        averageDelay: '200 ms',
        lastUsed: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        icon: <Users className="w-4 h-4" />,
        enabled: false,
        subscribers: 0,
        deliveryRate: 0,
        averageDelay: 'N/A',
        lastUsed: null
      }
    ],
    rules: [
      {
        id: 1,
        name: 'Emergency Response',
        description: 'Immediate alerts for falls, medical emergencies',
        trigger: 'Emergency Event',
        conditions: ['Fall Detection', 'Emergency Button', 'Critical Vital Signs'],
        actions: ['Send SMS', 'Push Notification', 'Page On-Call'],
        priority: 'critical',
        enabled: true,
        lastTriggered: new Date(Date.now() - 5 * 60 * 1000),
        triggerCount: 23
      },
      {
        id: 2,
        name: 'Medication Reminders',
        description: 'Alert staff for scheduled medications',
        trigger: 'Schedule',
        conditions: ['Medication Time', 'Not Administered'],
        actions: ['App Notification', 'Email Reminder'],
        priority: 'high',
        enabled: true,
        lastTriggered: new Date(Date.now() - 15 * 60 * 1000),
        triggerCount: 156
      },
      {
        id: 3,
        name: 'Staffing Alerts',
        description: 'Notify management of staffing issues',
        trigger: 'Threshold',
        conditions: ['Staff Count < Minimum', 'Shift Change'],
        actions: ['Email Management', 'SMS Supervisor'],
        priority: 'medium',
        enabled: true,
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
        triggerCount: 12
      },
      {
        id: 4,
        name: 'System Monitoring',
        description: 'Technical alerts for system issues',
        trigger: 'System Event',
        conditions: ['Service Down', 'High Error Rate', 'Database Issue'],
        actions: ['Slack IT Channel', 'Email Tech Team'],
        priority: 'high',
        enabled: true,
        lastTriggered: new Date(Date.now() - 2 * 60 * 1000),
        triggerCount: 8
      },
      {
        id: 5,
        name: 'Compliance Deadlines',
        description: 'Regulatory and compliance reminders',
        trigger: 'Date/Time',
        conditions: ['Deadline Approaching', 'Document Expiring'],
        actions: ['Email Stakeholders', 'Dashboard Alert'],
        priority: 'medium',
        enabled: true,
        lastTriggered: new Date(Date.now() - 60 * 60 * 1000),
        triggerCount: 34
      }
    ],
    templates: [
      {
        id: 1,
        name: 'Emergency Alert',
        category: 'Critical',
        subject: 'URGENT: {event_type} - Immediate Action Required',
        body: 'Emergency detected at {location}. {resident_name} requires immediate assistance. Event: {event_details}',
        channels: ['sms', 'push', 'app'],
        variables: ['event_type', 'location', 'resident_name', 'event_details']
      },
      {
        id: 2,
        name: 'Daily Report',
        category: 'Informational',
        subject: 'Daily Community Report - {date}',
        body: 'Summary for {date}: Occupancy {occupancy_rate}%, Incidents: {incident_count}, Staff Present: {staff_count}',
        channels: ['email'],
        variables: ['date', 'occupancy_rate', 'incident_count', 'staff_count']
      },
      {
        id: 3,
        name: 'Family Update',
        category: 'Communication',
        subject: 'Update for {resident_name}',
        body: 'Dear {family_name}, here is today\'s update for {resident_name}: {update_content}',
        channels: ['email', 'app'],
        variables: ['resident_name', 'family_name', 'update_content']
      }
    ],
    recipients: [
      {
        id: 1,
        name: 'All Staff',
        type: 'group',
        members: 89,
        channels: ['app', 'email'],
        notifications: {
          emergency: true,
          operational: true,
          informational: false
        }
      },
      {
        id: 2,
        name: 'Management Team',
        type: 'group',
        members: 12,
        channels: ['app', 'email', 'sms'],
        notifications: {
          emergency: true,
          operational: true,
          informational: true
        }
      },
      {
        id: 3,
        name: 'On-Call Staff',
        type: 'dynamic',
        members: 5,
        channels: ['sms', 'push'],
        notifications: {
          emergency: true,
          operational: false,
          informational: false
        }
      },
      {
        id: 4,
        name: 'Family Members',
        type: 'group',
        members: 234,
        channels: ['email', 'app'],
        notifications: {
          emergency: false,
          operational: false,
          informational: true
        }
      }
    ],
    analytics: {
      deliveryTrend: [
        { hour: '00:00', sent: 45, delivered: 44, failed: 1 },
        { hour: '04:00', sent: 23, delivered: 23, failed: 0 },
        { hour: '08:00', sent: 178, delivered: 175, failed: 3 },
        { hour: '12:00', sent: 234, delivered: 230, failed: 4 },
        { hour: '16:00', sent: 189, delivered: 186, failed: 3 },
        { hour: '20:00', sent: 145, delivered: 143, failed: 2 }
      ],
      channelPerformance: [
        { channel: 'In-App', sent: 1234, delivered: 1234, rate: 100 },
        { channel: 'Email', sent: 987, delivered: 972, rate: 98.5 },
        { channel: 'SMS', sent: 567, delivered: 562, rate: 99.2 },
        { channel: 'Push', sent: 345, delivered: 337, rate: 97.8 },
        { channel: 'Slack', sent: 234, delivered: 234, rate: 99.9 }
      ],
      responseMetrics: {
        averageResponseTime: 138, // seconds
        acknowledgedRate: 94,
        escalatedCount: 12,
        resolvedToday: 45
      }
    },
    settings: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '06:00',
        exceptions: ['emergency']
      },
      escalation: {
        enabled: true,
        levels: [
          { level: 1, delay: 5, recipients: 'Primary Contact' },
          { level: 2, delay: 10, recipients: 'Supervisor' },
          { level: 3, delay: 15, recipients: 'Management' }
        ]
      },
      throttling: {
        enabled: true,
        maxPerHour: 100,
        maxPerRecipient: 10
      },
      retention: {
        days: 90,
        archiveEnabled: true
      }
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge className="bg-red-600">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-500">Info</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <Badge className="bg-green-500">Acknowledged</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>;
      case 'resolved':
        return <Badge className="bg-blue-500">Resolved</Badge>;
      case 'investigating':
        return <Badge className="bg-purple-500">Investigating</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-600">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'app':
        return <Bell className="w-3 h-3" />;
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'sms':
        return <Phone className="w-3 h-3" />;
      case 'push':
        return <Smartphone className="w-3 h-3" />;
      case 'slack':
        return <MessageSquare className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BellRing className="w-6 h-6 mr-2 text-purple-500" />
            Real-Time Notification System
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Multi-channel alerts and instant notifications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {mockNotifications.summary.criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Alerts Active</AlertTitle>
          <AlertDescription>
            {mockNotifications.summary.criticalAlerts} critical alerts require immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold">{mockNotifications.summary.activeAlerts}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockNotifications.summary.criticalAlerts} critical
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sent Today</p>
                <p className="text-2xl font-bold">{mockNotifications.summary.todaySent}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockNotifications.summary.totalSent.toLocaleString()} total
                </p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                <p className="text-2xl font-bold">{mockNotifications.summary.deliveryRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${mockNotifications.summary.deliveryRate}%` }}
                  />
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-2xl font-bold">{mockNotifications.summary.averageResponseTime}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Average
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Alerts</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Real-time alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockNotifications.activeAlerts.map((alert) => (
                  <div key={alert.id} className={`border rounded p-4 ${
                    alert.type === 'critical' ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{alert.title}</p>
                          {getTypeBadge(alert.type)}
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {alert.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {alert.status === 'pending' && (
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        </span>
                        {alert.resident && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {alert.resident}
                          </span>
                        )}
                        {alert.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {alert.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {alert.channel.map((ch) => (
                          <span key={ch} className="flex items-center">
                            {getChannelIcon(ch)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {alert.responseTime && (
                      <div className="mt-2 text-sm text-green-600">
                        Responded by {alert.respondedBy} in {alert.responseTime}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure multi-channel notification delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockNotifications.channels.map((channel) => (
                  <Card key={channel.id} className={!channel.enabled ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {channel.icon}
                          <p className="font-semibold">{channel.name}</p>
                        </div>
                        <Switch checked={channel.enabled} />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Subscribers</span>
                          <span className="font-medium">{channel.subscribers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Delivery Rate</span>
                          <span className="font-medium">{channel.deliveryRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Avg Delay</span>
                          <span className="font-medium">{channel.averageDelay}</span>
                        </div>
                      </div>

                      {channel.lastUsed && (
                        <p className="text-xs text-gray-500 mt-3">
                          Last used {formatDistanceToNow(channel.lastUsed, { addSuffix: true })}
                        </p>
                      )}

                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification Rules</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              <CardDescription>Automated notification triggers and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockNotifications.rules.map((rule) => (
                  <div key={rule.id} className="border rounded p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{rule.name}</p>
                          {getPriorityBadge(rule.priority)}
                          <Switch checked={rule.enabled} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rule.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Trigger</p>
                        <Badge variant="outline">{rule.trigger}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Conditions</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.conditions.slice(0, 2).map((condition, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                          {rule.conditions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Actions</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.actions.slice(0, 2).map((action, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>Triggered {rule.triggerCount} times</span>
                      <span>Last: {formatDistanceToNow(rule.lastTriggered, { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Reusable notification templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockNotifications.templates.map((template) => (
                  <div key={template.id} className="border rounded p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{template.name}</p>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {template.subject}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {template.body}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {template.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {template.variables.length} variables
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recipient Groups</CardTitle>
              <CardDescription>Manage notification recipient lists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockNotifications.recipients.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{group.name}</p>
                          <p className="text-sm text-gray-500">
                            {group.members} members • {group.type}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Users className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Channels</span>
                          <div className="flex items-center space-x-1">
                            {group.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Notifications</p>
                          <div className="flex items-center justify-between text-sm">
                            <span>Emergency</span>
                            <Switch checked={group.notifications.emergency} disabled />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Operational</span>
                            <Switch checked={group.notifications.operational} disabled />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Informational</span>
                            <Switch checked={group.notifications.informational} disabled />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Delivery Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Trend</CardTitle>
                <CardDescription>Hourly notification delivery statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockNotifications.analytics.deliveryTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sent" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="delivered" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Delivery rates by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockNotifications.analytics.channelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Response Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Response Metrics</CardTitle>
              <CardDescription>Alert response and resolution statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">{mockNotifications.analytics.responseMetrics.averageResponseTime}s</p>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">{mockNotifications.analytics.responseMetrics.acknowledgedRate}%</p>
                  <p className="text-sm text-gray-500">Acknowledged Rate</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">{mockNotifications.analytics.responseMetrics.escalatedCount}</p>
                  <p className="text-sm text-gray-500">Escalated Today</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-2xl font-bold">{mockNotifications.analytics.responseMetrics.resolvedToday}</p>
                  <p className="text-sm text-gray-500">Resolved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Suppress non-critical notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Quiet Hours</Label>
                    <Switch checked={mockNotifications.settings.quietHours.enabled} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input type="time" value={mockNotifications.settings.quietHours.start} />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="time" value={mockNotifications.settings.quietHours.end} />
                    </div>
                  </div>

                  <div>
                    <Label>Exceptions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mockNotifications.settings.quietHours.exceptions.map((exception) => (
                        <Badge key={exception} variant="outline">
                          {exception}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escalation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Settings</CardTitle>
                <CardDescription>Configure automatic alert escalation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Escalation</Label>
                    <Switch checked={mockNotifications.settings.escalation.enabled} />
                  </div>
                  
                  {mockNotifications.settings.escalation.levels.map((level, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Level {level.level}</p>
                        <p className="text-sm text-gray-500">After {level.delay} minutes</p>
                      </div>
                      <Badge variant="outline">{level.recipients}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Throttling */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>Prevent notification flooding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Throttling</Label>
                    <Switch checked={mockNotifications.settings.throttling.enabled} />
                  </div>
                  
                  <div>
                    <Label>Max Notifications per Hour</Label>
                    <Input type="number" value={mockNotifications.settings.throttling.maxPerHour} />
                  </div>

                  <div>
                    <Label>Max per Recipient</Label>
                    <Input type="number" value={mockNotifications.settings.throttling.maxPerRecipient} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
                <CardDescription>Notification history and archival</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Retention Period (days)</Label>
                    <Input type="number" value={mockNotifications.settings.retention.days} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Enable Archiving</Label>
                    <Switch checked={mockNotifications.settings.retention.archiveEnabled} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}