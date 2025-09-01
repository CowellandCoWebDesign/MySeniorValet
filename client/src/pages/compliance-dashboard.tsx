import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, FileCheck, AlertTriangle, CheckCircle, Clock, 
  FileText, Download, Calendar, Users, Building2, 
  Gavel, Heart, UserCheck, Activity, Pill
} from 'lucide-react';
import { ProfessionalNavbar } from '@/components/ProfessionalNavbar';

/**
 * Phase 5 Compliance Management System
 * Comprehensive regulatory compliance tracking with real state regulations
 * 
 * Features:
 * - State-specific regulations tracking
 * - License and certification management
 * - Audit trail and history
 * - Compliance scoring
 * - Automated alerts and reminders
 * - Document management
 * - Multi-jurisdiction support
 */

interface ComplianceMetrics {
  overallScore: number;
  totalRegulations: number;
  compliantItems: number;
  pendingItems: number;
  overduItems: number;
  upcomingDeadlines: number;
  lastAuditDate: string;
  nextAuditDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Regulation {
  id: string;
  category: string;
  title: string;
  description: string;
  state: string;
  status: 'compliant' | 'pending' | 'overdue' | 'not-applicable';
  lastChecked: string;
  nextDue: string;
  frequency: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  documents: number;
}

interface License {
  id: string;
  type: string;
  licenseNumber: string;
  state: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired';
  holder: string;
  renewalCost: number;
  daysUntilExpiry: number;
}

interface AuditRecord {
  id: string;
  date: string;
  type: string;
  auditor: string;
  score: number;
  findings: number;
  status: 'passed' | 'failed' | 'conditional';
  nextScheduled: string;
}

export default function ComplianceDashboard() {
  const [selectedState, setSelectedState] = useState('CA');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fetch compliance metrics
  const { data: metrics } = useQuery<ComplianceMetrics>({
    queryKey: ['/api/compliance/metrics', selectedState],
    enabled: true,
    initialData: {
      overallScore: 92,
      totalRegulations: 156,
      compliantItems: 143,
      pendingItems: 8,
      overduItems: 5,
      upcomingDeadlines: 12,
      lastAuditDate: '2025-07-15',
      nextAuditDate: '2025-10-15',
      riskLevel: 'low'
    }
  });
  
  // Fetch regulations
  const { data: regulations } = useQuery<Regulation[]>({
    queryKey: ['/api/compliance/regulations', selectedState, selectedCategory],
    enabled: true,
    initialData: [
      {
        id: '1',
        category: 'Healthcare',
        title: 'Medication Management Standards',
        description: 'California Code of Regulations Title 22, Division 6 - Medication storage, administration, and documentation requirements',
        state: 'CA',
        status: 'compliant',
        lastChecked: '2025-08-20',
        nextDue: '2025-09-20',
        frequency: 'Monthly',
        severity: 'critical',
        documents: 5
      },
      {
        id: '2',
        category: 'Safety',
        title: 'Fire Safety Inspection',
        description: 'Annual fire safety inspection and emergency evacuation plan review per California Health & Safety Code',
        state: 'CA',
        status: 'compliant',
        lastChecked: '2025-03-01',
        nextDue: '2026-03-01',
        frequency: 'Annual',
        severity: 'critical',
        documents: 3
      },
      {
        id: '3',
        category: 'Staffing',
        title: 'Staff-to-Resident Ratio',
        description: 'Maintain minimum staffing ratios as per California RCF regulations - 1:15 during day, 1:30 at night',
        state: 'CA',
        status: 'compliant',
        lastChecked: '2025-08-30',
        nextDue: '2025-09-06',
        frequency: 'Weekly',
        severity: 'high',
        documents: 2
      },
      {
        id: '4',
        category: 'Healthcare',
        title: 'Resident Health Records',
        description: 'HIPAA-compliant maintenance and security of resident health information',
        state: 'Federal',
        status: 'compliant',
        lastChecked: '2025-08-15',
        nextDue: '2025-11-15',
        frequency: 'Quarterly',
        severity: 'high',
        documents: 8
      },
      {
        id: '5',
        category: 'Nutrition',
        title: 'Dietary Services Compliance',
        description: 'Menu approval and nutritional standards per state dietary requirements',
        state: 'CA',
        status: 'pending',
        lastChecked: '2025-08-01',
        nextDue: '2025-09-05',
        frequency: 'Monthly',
        severity: 'medium',
        documents: 4
      },
      {
        id: '6',
        category: 'Safety',
        title: 'Background Check Compliance',
        description: 'Criminal background checks for all staff per California DSS requirements',
        state: 'CA',
        status: 'compliant',
        lastChecked: '2025-08-28',
        nextDue: '2025-09-28',
        frequency: 'Ongoing',
        severity: 'critical',
        documents: 12
      },
      {
        id: '7',
        category: 'Facility',
        title: 'ADA Accessibility Standards',
        description: 'Americans with Disabilities Act compliance for facility accessibility',
        state: 'Federal',
        status: 'compliant',
        lastChecked: '2025-06-01',
        nextDue: '2026-06-01',
        frequency: 'Annual',
        severity: 'high',
        documents: 6
      },
      {
        id: '8',
        category: 'Training',
        title: 'Staff Training Requirements',
        description: 'Mandatory 40 hours initial training, 10 hours annual continuing education',
        state: 'CA',
        status: 'overdue',
        lastChecked: '2025-07-15',
        nextDue: '2025-08-15',
        frequency: 'Annual',
        severity: 'high',
        documents: 15
      }
    ]
  });
  
  // Fetch licenses
  const { data: licenses } = useQuery<License[]>({
    queryKey: ['/api/compliance/licenses', selectedState],
    enabled: true,
    initialData: [
      {
        id: '1',
        type: 'Residential Care Facility License',
        licenseNumber: 'RCF-CA-2021-4578',
        state: 'CA',
        issueDate: '2021-03-15',
        expiryDate: '2026-03-14',
        status: 'active',
        holder: 'Sunrise Valley Senior Living',
        renewalCost: 2500,
        daysUntilExpiry: 195
      },
      {
        id: '2',
        type: 'Administrator License',
        licenseNumber: 'ADM-CA-2022-8901',
        state: 'CA',
        issueDate: '2022-06-01',
        expiryDate: '2025-11-30',
        status: 'expiring',
        holder: 'John Smith',
        renewalCost: 450,
        daysUntilExpiry: 90
      },
      {
        id: '3',
        type: 'Food Service Permit',
        licenseNumber: 'FSP-CA-2024-3421',
        state: 'CA',
        issueDate: '2024-01-01',
        expiryDate: '2025-12-31',
        status: 'active',
        holder: 'Sunrise Valley Kitchen',
        renewalCost: 800,
        daysUntilExpiry: 121
      },
      {
        id: '4',
        type: 'Business License',
        licenseNumber: 'BL-CITY-2025-0987',
        state: 'CA',
        issueDate: '2025-01-01',
        expiryDate: '2025-12-31',
        status: 'active',
        holder: 'Sunrise Valley LLC',
        renewalCost: 1200,
        daysUntilExpiry: 121
      }
    ]
  });
  
  // Fetch audit history
  const { data: audits } = useQuery<AuditRecord[]>({
    queryKey: ['/api/compliance/audits'],
    enabled: true,
    initialData: [
      {
        id: '1',
        date: '2025-07-15',
        type: 'State Annual Inspection',
        auditor: 'California DSS',
        score: 94,
        findings: 3,
        status: 'passed',
        nextScheduled: '2026-07-15'
      },
      {
        id: '2',
        date: '2025-04-20',
        type: 'Fire Safety Inspection',
        auditor: 'County Fire Department',
        score: 100,
        findings: 0,
        status: 'passed',
        nextScheduled: '2026-04-20'
      },
      {
        id: '3',
        date: '2025-01-10',
        type: 'Health Department Review',
        auditor: 'County Health Services',
        score: 88,
        findings: 5,
        status: 'conditional',
        nextScheduled: '2025-10-10'
      },
      {
        id: '4',
        date: '2024-10-05',
        type: 'Medicare Certification',
        auditor: 'CMS Inspector',
        score: 91,
        findings: 4,
        status: 'passed',
        nextScheduled: '2025-10-05'
      }
    ]
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'active':
      case 'passed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'pending':
      case 'expiring':
      case 'conditional':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'overdue':
      case 'expired':
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Healthcare':
        return <Heart className="h-4 w-4" />;
      case 'Safety':
        return <Shield className="h-4 w-4" />;
      case 'Staffing':
        return <Users className="h-4 w-4" />;
      case 'Facility':
        return <Building2 className="h-4 w-4" />;
      case 'Nutrition':
        return <Activity className="h-4 w-4" />;
      case 'Training':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <ProfessionalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Compliance Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Regulatory compliance tracking and audit management
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="Federal">Federal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
        
        {/* Compliance Score Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compliance Health Score</CardTitle>
            <CardDescription>Overall regulatory compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (metrics?.overallScore || 0) / 100)}`}
                      className="text-green-600 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute">
                    <div className="text-3xl font-bold">{metrics?.overallScore}%</div>
                    <Badge variant={metrics?.riskLevel === 'low' ? 'default' : metrics?.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                      {metrics?.riskLevel} risk
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Compliant</span>
                  <span className="font-semibold text-green-600">{metrics?.compliantItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="font-semibold text-yellow-600">{metrics?.pendingItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                  <span className="font-semibold text-red-600">{metrics?.overduItems}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Last Audit</p>
                    <p className="font-medium">{new Date(metrics?.lastAuditDate || '').toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Next Audit</p>
                    <p className="font-medium">{new Date(metrics?.nextAuditDate || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Upcoming Deadlines</AlertTitle>
                  <AlertDescription className="text-xs">
                    {metrics?.upcomingDeadlines} items due in next 30 days
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs */}
        <Tabs defaultValue="regulations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="regulations">Regulations</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="audits">Audit History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="regulations" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Active Regulations</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Staffing">Staffing</SelectItem>
                  <SelectItem value="Facility">Facility</SelectItem>
                  <SelectItem value="Nutrition">Nutrition</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {regulations?.map((reg) => (
                <Card key={reg.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(reg.category)}
                          <Badge variant="outline">{reg.category}</Badge>
                          <Badge variant="outline">{reg.state}</Badge>
                          {getSeverityIcon(reg.severity)}
                          <Badge className={getStatusColor(reg.status)}>
                            {reg.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{reg.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {reg.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Frequency: {reg.frequency}</span>
                          <span>Last Checked: {new Date(reg.lastChecked).toLocaleDateString()}</span>
                          <span>Next Due: {new Date(reg.nextDue).toLocaleDateString()}</span>
                          <span>{reg.documents} documents</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileCheck className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        {reg.status === 'overdue' && (
                          <Button size="sm" variant="destructive">
                            Update Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="licenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Licenses & Permits</CardTitle>
                <CardDescription>Manage facility and staff certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {licenses?.map((license) => (
                    <div key={license.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Gavel className="h-4 w-4 text-gray-400" />
                          <h4 className="font-semibold">{license.type}</h4>
                          <Badge className={getStatusColor(license.status)}>
                            {license.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          License #: {license.licenseNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Holder: {license.holder}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>Issued: {new Date(license.issueDate).toLocaleDateString()}</span>
                          <span>Expires: {new Date(license.expiryDate).toLocaleDateString()}</span>
                          <span className={license.daysUntilExpiry < 90 ? 'text-yellow-600 font-semibold' : ''}>
                            {license.daysUntilExpiry} days remaining
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Renewal Cost</p>
                        <p className="font-semibold">${license.renewalCost}</p>
                        {license.status === 'expiring' && (
                          <Button size="sm" className="mt-2">
                            Renew Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit & Inspection History</CardTitle>
                <CardDescription>Track compliance audits and inspection results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Auditor</th>
                        <th className="text-center py-2">Score</th>
                        <th className="text-center py-2">Findings</th>
                        <th className="text-center py-2">Status</th>
                        <th className="text-left py-2">Next Scheduled</th>
                        <th className="text-center py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits?.map((audit) => (
                        <tr key={audit.id} className="border-b">
                          <td className="py-3">{new Date(audit.date).toLocaleDateString()}</td>
                          <td className="py-3">{audit.type}</td>
                          <td className="py-3">{audit.auditor}</td>
                          <td className="py-3 text-center">
                            <Badge variant="outline">{audit.score}%</Badge>
                          </td>
                          <td className="py-3 text-center">{audit.findings}</td>
                          <td className="py-3 text-center">
                            <Badge className={getStatusColor(audit.status)}>
                              {audit.status}
                            </Badge>
                          </td>
                          <td className="py-3">{new Date(audit.nextScheduled).toLocaleDateString()}</td>
                          <td className="py-3 text-center">
                            <Button size="sm" variant="ghost">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Documents</CardTitle>
                <CardDescription>Certificates, reports, and regulatory filings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'State License Certificate', type: 'PDF', size: '2.3 MB', date: '2025-03-15' },
                    { name: 'Fire Safety Certificate', type: 'PDF', size: '1.8 MB', date: '2025-04-20' },
                    { name: 'Health Inspection Report', type: 'PDF', size: '3.1 MB', date: '2025-07-15' },
                    { name: 'Staff Training Records', type: 'XLSX', size: '856 KB', date: '2025-08-01' },
                    { name: 'Medicare Certification', type: 'PDF', size: '1.2 MB', date: '2024-10-05' },
                    { name: 'Insurance Certificates', type: 'PDF', size: '4.5 MB', date: '2025-01-01' }
                  ].map((doc, idx) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <Badge variant="outline">{doc.type}</Badge>
                      </div>
                      <h4 className="font-medium mt-2">{doc.name}</h4>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>{doc.size}</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}