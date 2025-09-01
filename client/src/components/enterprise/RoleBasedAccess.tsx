import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, User, Users, Lock, Unlock, Key, Settings, Plus, Edit, Trash2,
  UserCheck, UserX, UserPlus, UserMinus, Eye, EyeOff, AlertTriangle,
  CheckCircle, XCircle, Info, Clock, Activity, Database, FileText,
  DollarSign, Heart, Home, Calendar, Mail, Phone, Globe, Layers
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

interface RoleBasedAccessProps {
  communityId: number;
}

export function RoleBasedAccess({ communityId }: RoleBasedAccessProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);

  // Mock RBAC data - replace with real API data
  const mockRBAC = {
    summary: {
      totalUsers: 145,
      activeUsers: 89,
      totalRoles: 12,
      customRoles: 7,
      pendingRequests: 3,
      securityScore: 94,
      lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      complianceLevel: 'HIPAA Compliant'
    },
    roles: [
      {
        id: 1,
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        type: 'system',
        users: 2,
        permissions: 'all',
        createdAt: new Date('2024-01-01'),
        lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        critical: true,
        color: 'red'
      },
      {
        id: 2,
        name: 'Community Administrator',
        description: 'Manage community settings and operations',
        type: 'system',
        users: 5,
        permissions: 89,
        createdAt: new Date('2024-01-01'),
        lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        critical: true,
        color: 'orange'
      },
      {
        id: 3,
        name: 'Clinical Director',
        description: 'Oversee all clinical operations and healthcare',
        type: 'predefined',
        users: 3,
        permissions: 67,
        createdAt: new Date('2024-02-01'),
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        critical: false,
        color: 'blue'
      },
      {
        id: 4,
        name: 'Nurse Manager',
        description: 'Manage nursing staff and resident care',
        type: 'predefined',
        users: 8,
        permissions: 45,
        createdAt: new Date('2024-02-01'),
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        critical: false,
        color: 'green'
      },
      {
        id: 5,
        name: 'Care Staff',
        description: 'Provide direct resident care and support',
        type: 'predefined',
        users: 45,
        permissions: 28,
        createdAt: new Date('2024-02-01'),
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        critical: false,
        color: 'purple'
      },
      {
        id: 6,
        name: 'Finance Manager',
        description: 'Manage financial operations and reporting',
        type: 'custom',
        users: 2,
        permissions: 34,
        createdAt: new Date('2024-03-01'),
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        critical: false,
        color: 'indigo'
      },
      {
        id: 7,
        name: 'Family Portal Access',
        description: 'View resident information and updates',
        type: 'custom',
        users: 67,
        permissions: 12,
        createdAt: new Date('2024-04-01'),
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        critical: false,
        color: 'pink'
      },
      {
        id: 8,
        name: 'Vendor Access',
        description: 'Limited access for service providers',
        type: 'custom',
        users: 12,
        permissions: 8,
        createdAt: new Date('2024-05-01'),
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        critical: false,
        color: 'gray'
      }
    ],
    users: [
      {
        id: 1,
        name: 'John Martinez',
        email: 'john.martinez@community.com',
        role: 'Community Administrator',
        department: 'Administration',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        created: new Date('2024-01-15'),
        mfaEnabled: true,
        accessLevel: 'high'
      },
      {
        id: 2,
        name: 'Sarah Williams',
        email: 'sarah.williams@community.com',
        role: 'Clinical Director',
        department: 'Healthcare',
        status: 'active',
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
        created: new Date('2024-02-01'),
        mfaEnabled: true,
        accessLevel: 'high'
      },
      {
        id: 3,
        name: 'Emily Chen',
        email: 'emily.chen@community.com',
        role: 'Nurse Manager',
        department: 'Healthcare',
        status: 'active',
        lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000),
        created: new Date('2024-02-15'),
        mfaEnabled: false,
        accessLevel: 'medium'
      },
      {
        id: 4,
        name: 'Michael Brown',
        email: 'michael.brown@community.com',
        role: 'Care Staff',
        department: 'Healthcare',
        status: 'inactive',
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        created: new Date('2024-03-01'),
        mfaEnabled: false,
        accessLevel: 'low'
      },
      {
        id: 5,
        name: 'Jennifer Davis',
        email: 'jennifer.davis@community.com',
        role: 'Finance Manager',
        department: 'Finance',
        status: 'active',
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        created: new Date('2024-03-15'),
        mfaEnabled: true,
        accessLevel: 'high'
      }
    ],
    permissions: {
      categories: [
        {
          name: 'Resident Management',
          icon: <Heart className="w-4 h-4" />,
          permissions: [
            { id: 'res.view', name: 'View Residents', description: 'View resident profiles and information' },
            { id: 'res.edit', name: 'Edit Residents', description: 'Modify resident information' },
            { id: 'res.create', name: 'Create Residents', description: 'Add new residents' },
            { id: 'res.delete', name: 'Delete Residents', description: 'Remove resident records' },
            { id: 'res.medical', name: 'Medical Records', description: 'Access medical and health records' },
            { id: 'res.care', name: 'Care Plans', description: 'Manage resident care plans' }
          ]
        },
        {
          name: 'Financial Management',
          icon: <DollarSign className="w-4 h-4" />,
          permissions: [
            { id: 'fin.view', name: 'View Finances', description: 'View financial reports and data' },
            { id: 'fin.edit', name: 'Edit Finances', description: 'Modify financial records' },
            { id: 'fin.billing', name: 'Billing', description: 'Manage billing and invoices' },
            { id: 'fin.payroll', name: 'Payroll', description: 'Access payroll information' },
            { id: 'fin.budget', name: 'Budget', description: 'Manage budgets and forecasts' },
            { id: 'fin.audit', name: 'Audit', description: 'Perform financial audits' }
          ]
        },
        {
          name: 'Staff Management',
          icon: <Users className="w-4 h-4" />,
          permissions: [
            { id: 'staff.view', name: 'View Staff', description: 'View staff profiles' },
            { id: 'staff.edit', name: 'Edit Staff', description: 'Modify staff information' },
            { id: 'staff.schedule', name: 'Scheduling', description: 'Manage staff schedules' },
            { id: 'staff.performance', name: 'Performance', description: 'View performance reviews' },
            { id: 'staff.training', name: 'Training', description: 'Manage training programs' },
            { id: 'staff.hr', name: 'HR Functions', description: 'Access HR management tools' }
          ]
        },
        {
          name: 'System Administration',
          icon: <Settings className="w-4 h-4" />,
          permissions: [
            { id: 'sys.settings', name: 'System Settings', description: 'Configure system settings' },
            { id: 'sys.users', name: 'User Management', description: 'Manage user accounts' },
            { id: 'sys.roles', name: 'Role Management', description: 'Configure roles and permissions' },
            { id: 'sys.audit', name: 'Audit Logs', description: 'View system audit logs' },
            { id: 'sys.backup', name: 'Backup', description: 'Manage system backups' },
            { id: 'sys.integration', name: 'Integrations', description: 'Configure external integrations' }
          ]
        },
        {
          name: 'Reports & Analytics',
          icon: <FileText className="w-4 h-4" />,
          permissions: [
            { id: 'rep.view', name: 'View Reports', description: 'Access generated reports' },
            { id: 'rep.create', name: 'Create Reports', description: 'Generate new reports' },
            { id: 'rep.export', name: 'Export Data', description: 'Export reports and data' },
            { id: 'rep.analytics', name: 'Analytics', description: 'Access analytics dashboard' },
            { id: 'rep.custom', name: 'Custom Reports', description: 'Create custom reports' },
            { id: 'rep.schedule', name: 'Schedule Reports', description: 'Schedule automated reports' }
          ]
        }
      ]
    },
    accessRequests: [
      {
        id: 1,
        user: 'Alex Thompson',
        currentRole: 'Care Staff',
        requestedRole: 'Nurse Manager',
        reason: 'Recently completed RN certification',
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high'
      },
      {
        id: 2,
        user: 'Maria Garcia',
        currentRole: 'Family Portal Access',
        requestedPermission: 'View Medical Records',
        reason: 'Primary caregiver for resident',
        requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'medium'
      },
      {
        id: 3,
        user: 'David Lee',
        currentRole: 'Vendor Access',
        requestedPermission: 'View Maintenance Reports',
        reason: 'Need access to complete HVAC service',
        requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'low'
      }
    ],
    activityLog: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        action: 'Role Modified',
        user: 'Admin',
        details: 'Updated permissions for Nurse Manager role',
        type: 'modify'
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        action: 'User Added',
        user: 'John Martinez',
        details: 'Added new user: Jennifer Wilson (Care Staff)',
        type: 'create'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: 'Permission Revoked',
        user: 'System',
        details: 'Removed financial access from inactive user',
        type: 'security'
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        action: 'MFA Enabled',
        user: 'Sarah Williams',
        details: 'Two-factor authentication activated',
        type: 'security'
      }
    ],
    securityMetrics: {
      mfaAdoption: 68,
      passwordStrength: 82,
      inactiveAccounts: 12,
      privilegedAccounts: 15,
      lastSecurityAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      complianceChecks: {
        hipaa: true,
        gdpr: true,
        stateRegulations: true
      }
    }
  };

  const getRoleBadge = (type: string) => {
    switch (type) {
      case 'system':
        return <Badge className="bg-red-500">System</Badge>;
      case 'predefined':
        return <Badge className="bg-blue-500">Predefined</Badge>;
      case 'custom':
        return <Badge className="bg-purple-500">Custom</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'modify':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'security':
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="w-6 h-6 mr-2 text-purple-500" />
            Role-Based Access Control
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles, permissions, and access controls
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowAssignRole(true)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Assign Role
          </Button>
          <Button onClick={() => setShowCreateRole(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Security Alert */}
      {mockRBAC.accessRequests.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pending Access Requests</AlertTitle>
          <AlertDescription>
            {mockRBAC.accessRequests.length} access requests require review and approval
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold">{mockRBAC.summary.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockRBAC.summary.activeUsers} active
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Roles</p>
                <p className="text-2xl font-bold">{mockRBAC.summary.totalRoles}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {mockRBAC.summary.customRoles} custom
                </p>
              </div>
              <Key className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={mockRBAC.summary.pendingRequests > 0 ? 'border-orange-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">{mockRBAC.summary.pendingRequests}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Require approval
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
                <p className="text-2xl font-bold">{mockRBAC.summary.securityScore}%</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${mockRBAC.summary.securityScore}%` }}
                  />
                </div>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RBAC Tabs */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>Manage user roles and their associated permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRBAC.roles.map((role) => (
                  <div key={role.id} className="border rounded p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold">{role.name}</p>
                          {getRoleBadge(role.type)}
                          {role.critical && <Badge className="bg-red-600">Critical</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {role.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {role.type !== 'system' && (
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Users</p>
                        <p className="font-medium">{role.users} assigned</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Permissions</p>
                        <p className="font-medium">
                          {role.permissions === 'all' ? 'All' : `${role.permissions} permissions`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{format(role.createdAt, 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Modified</p>
                        <p className="font-medium">
                          {formatDistanceToNow(role.lastModified, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search users..." className="w-64" />
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add User
                  </Button>
                </div>
              </div>
              <CardDescription>Manage user accounts and their role assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-center p-2">Role</th>
                      <th className="text-center p-2">Department</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Last Login</th>
                      <th className="text-center p-2">MFA</th>
                      <th className="text-center p-2">Access</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRBAC.users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="text-center p-2">{user.department}</td>
                        <td className="text-center p-2">{getStatusBadge(user.status)}</td>
                        <td className="text-center p-2 text-sm">
                          {formatDistanceToNow(user.lastLogin, { addSuffix: true })}
                        </td>
                        <td className="text-center p-2">
                          {user.mfaEnabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-2">{getAccessLevelBadge(user.accessLevel)}</td>
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center space-x-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              {user.status === 'active' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Button>
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

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Configure granular permissions for roles</CardDescription>
            </CardHeader>
            <CardContent>
              {mockRBAC.permissions.categories.map((category, idx) => (
                <div key={idx} className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    {category.icon}
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <Checkbox />
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-sm text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{permission.id}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>Review and approve pending access requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRBAC.accessRequests.map((request) => (
                  <div key={request.id} className="border rounded p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-semibold">{request.user}</p>
                          <Badge className={
                            request.priority === 'high' ? 'bg-red-500' :
                            request.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }>
                            {request.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.requestedRole ? 
                            `Requesting role change: ${request.currentRole} → ${request.requestedRole}` :
                            `Requesting permission: ${request.requestedPermission}`
                          }
                        </p>
                        <p className="text-sm mb-2">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested {formatDistanceToNow(request.requestDate, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="w-4 h-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Security Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
                <CardDescription>System security indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">MFA Adoption</span>
                      <span className="text-sm font-medium">{mockRBAC.securityMetrics.mfaAdoption}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${mockRBAC.securityMetrics.mfaAdoption}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Password Strength</span>
                      <span className="text-sm font-medium">{mockRBAC.securityMetrics.passwordStrength}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${mockRBAC.securityMetrics.passwordStrength}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-2xl font-bold">{mockRBAC.securityMetrics.inactiveAccounts}</p>
                      <p className="text-sm text-gray-500">Inactive Accounts</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-2xl font-bold">{mockRBAC.securityMetrics.privilegedAccounts}</p>
                      <p className="text-sm text-gray-500">Privileged Users</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Regulatory compliance checks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span>HIPAA Compliance</span>
                    </div>
                    {mockRBAC.securityMetrics.complianceChecks.hipaa ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>GDPR Compliance</span>
                    </div>
                    {mockRBAC.securityMetrics.complianceChecks.gdpr ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>State Regulations</span>
                    </div>
                    {mockRBAC.securityMetrics.complianceChecks.stateRegulations ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Security Audit</p>
                    <p className="font-medium">
                      {format(mockRBAC.securityMetrics.lastSecurityAudit, 'MMMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(mockRBAC.securityMetrics.lastSecurityAudit, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Access control changes and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRBAC.activityLog.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 border rounded">
                    {getActionIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">By: {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}