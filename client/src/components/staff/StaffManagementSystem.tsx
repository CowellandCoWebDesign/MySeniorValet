import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Calendar, 
  Clock, 
  Award, 
  BookOpen,
  Star,
  AlertCircle,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  UserCheck,
  UserX,
  TrendingUp,
  Plus,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  photo: string;
  email: string;
  phone: string;
  certifications: string[];
  specializations: string[];
  shift: string;
  status: 'on-duty' | 'off-duty' | 'on-break' | 'vacation';
  rating: number;
  yearsExperience: number;
  languages: string[];
  emergencyContact: string;
  nextTraining: string;
  complianceScore: number;
}

interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'no-show';
}

interface Training {
  id: string;
  name: string;
  type: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'overdue' | 'completed';
  mandatory: boolean;
  credits: number;
}

interface StaffManagementSystemProps {
  communityId: string;
  viewMode: 'community' | 'family';
}

export default function StaffManagementSystem({ communityId, viewMode }: StaffManagementSystemProps) {
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data - will be replaced with API calls
  const [staffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson, RN',
      role: 'Director of Nursing',
      department: 'Nursing',
      photo: '/api/placeholder/100/100',
      email: 'sarah.j@community.com',
      phone: '(555) 123-4567',
      certifications: ['RN', 'CPR', 'Dementia Care', 'Wound Care'],
      specializations: ['Memory Care', 'Rehabilitation', 'Palliative Care'],
      shift: 'Day Shift (7AM-3PM)',
      status: 'on-duty',
      rating: 4.9,
      yearsExperience: 15,
      languages: ['English', 'Spanish'],
      emergencyContact: '(555) 987-6543',
      nextTraining: 'Annual CPR Recertification',
      complianceScore: 98
    },
    {
      id: '2',
      name: 'Michael Chen, LPN',
      role: 'Charge Nurse',
      department: 'Nursing',
      photo: '/api/placeholder/100/100',
      email: 'michael.c@community.com',
      phone: '(555) 234-5678',
      certifications: ['LPN', 'CPR', 'Medication Administration'],
      specializations: ['Cardiac Care', 'Diabetes Management'],
      shift: 'Evening Shift (3PM-11PM)',
      status: 'off-duty',
      rating: 4.7,
      yearsExperience: 8,
      languages: ['English', 'Mandarin'],
      emergencyContact: '(555) 876-5432',
      nextTraining: 'Infection Control Update',
      complianceScore: 95
    }
  ]);

  const [todayShifts] = useState<Shift[]>([
    {
      id: '1',
      staffId: '1',
      staffName: 'Sarah Johnson, RN',
      date: selectedDate,
      startTime: '7:00 AM',
      endTime: '3:00 PM',
      department: 'Nursing',
      status: 'in-progress'
    },
    {
      id: '2',
      staffId: '3',
      staffName: 'Emily Rodriguez, CNA',
      date: selectedDate,
      startTime: '7:00 AM',
      endTime: '3:00 PM',
      department: 'Care Team',
      status: 'in-progress'
    }
  ]);

  const [trainings] = useState<Training[]>([
    {
      id: '1',
      name: 'Annual CPR Recertification',
      type: 'Safety',
      dueDate: '2025-10-15',
      status: 'pending',
      mandatory: true,
      credits: 4
    },
    {
      id: '2',
      name: 'Dementia Care Best Practices',
      type: 'Clinical',
      dueDate: '2025-09-30',
      status: 'pending',
      mandatory: false,
      credits: 8
    }
  ]);

  const handleAddStaff = () => {
    toast({
      title: "Add Staff Member",
      description: "Staff member form would open here"
    });
  };

  const handleEditSchedule = () => {
    toast({
      title: "Edit Schedule",
      description: "Schedule editor would open here"
    });
  };

  const handleAddTraining = () => {
    toast({
      title: "Schedule Training",
      description: "Training scheduler would open here"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty': return 'bg-green-500';
      case 'off-duty': return 'bg-gray-400';
      case 'on-break': return 'bg-yellow-500';
      case 'vacation': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            {viewMode === 'community' ? 'Staff Management' : 'Care Team Directory'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {viewMode === 'community' 
              ? 'Manage staff schedules, certifications, and training'
              : 'Meet the dedicated team caring for your loved one'}
          </p>
        </div>
        {viewMode === 'community' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" onClick={handleAddStaff}>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Duty Now</p>
                <p className="text-2xl font-bold text-green-600">16</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold text-green-600">96%</p>
              </div>
              <Shield className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="directory">
            <Users className="w-4 h-4 mr-2" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="w-4 h-4 mr-2" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="training">
            <GraduationCap className="w-4 h-4 mr-2" />
            Training
          </TabsTrigger>
        </TabsList>

        {/* Staff Directory Tab */}
        <TabsContent value="directory" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search staff by name, role, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="care">Care Team</SelectItem>
                <SelectItem value="dining">Dining Services</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="admin">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.map((staff) => (
              <Card key={staff.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedStaff(staff)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={staff.photo} />
                      <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{staff.name}</h3>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                        <Badge className={`${getStatusColor(staff.status)} text-white`}>
                          {staff.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-3 h-3" />
                          <span>{staff.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{staff.shift}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-sm font-medium">{staff.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            • {staff.yearsExperience} years exp
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {staff.certifications.slice(0, 3).map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                          {staff.certifications.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{staff.certifications.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Badge variant="outline">
                {todayShifts.filter(s => s.status === 'in-progress').length} Active Shifts
              </Badge>
            </div>
            {viewMode === 'community' && (
              <Button onClick={handleEditSchedule}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Schedule
              </Button>
            )}
          </div>

          {/* Department Schedule Grid */}
          <div className="grid gap-4">
            {['Nursing', 'Care Team', 'Dining Services', 'Activities'].map(dept => (
              <Card key={dept}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{dept}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayShifts
                      .filter(shift => shift.department === dept || (dept === 'Care Team' && shift.department === 'Care Team'))
                      .map(shift => (
                        <div key={shift.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>{shift.staffName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{shift.staffName}</p>
                              <p className="text-sm text-muted-foreground">
                                {shift.startTime} - {shift.endTime}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            shift.status === 'in-progress' ? 'bg-green-500 text-white' :
                            shift.status === 'completed' ? 'bg-gray-500 text-white' :
                            'bg-yellow-500 text-white'
                          }>
                            {shift.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {viewMode === 'community' 
                ? '3 certifications expiring in the next 30 days. Click to view details.'
                : 'All care team members maintain current certifications and undergo regular training.'}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {staffMembers.map(staff => (
              <Card key={staff.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={staff.photo} />
                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{staff.name}</h4>
                        <p className="text-sm text-muted-foreground">{staff.role}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">Compliance Score:</span>
                            <span className={`font-semibold ${getComplianceColor(staff.complianceScore)}`}>
                              {staff.complianceScore}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {staff.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {viewMode === 'community' && (
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-3 h-3 mr-1" />
                        Update
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Training & Development</h3>
              <p className="text-sm text-muted-foreground">
                {viewMode === 'community' 
                  ? 'Manage staff training programs and track compliance'
                  : 'Our staff undergoes continuous training to provide the best care'}
              </p>
            </div>
            {viewMode === 'community' && (
              <Button onClick={handleAddTraining}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Training
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {trainings.map(training => (
              <Card key={training.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">{training.name}</h4>
                        {training.mandatory && (
                          <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Type: {training.type}</span>
                        <span>Credits: {training.credits} CE</span>
                        <span>Due: {new Date(training.dueDate).toLocaleDateString()}</span>
                      </div>
                      <Progress value={training.status === 'completed' ? 100 : 30} className="w-full h-2" />
                    </div>
                    {viewMode === 'community' && (
                      <Badge className={
                        training.status === 'completed' ? 'bg-green-500 text-white' :
                        training.status === 'overdue' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }>
                        {training.status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Staff Profile</CardTitle>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setSelectedStaff(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedStaff.photo} />
                  <AvatarFallback>{selectedStaff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                  <p className="text-muted-foreground">{selectedStaff.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStatusColor(selectedStaff.status)} text-white`}>
                      {selectedStaff.status.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{selectedStaff.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Contact Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{selectedStaff.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{selectedStaff.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Department & Shift</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">{selectedStaff.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{selectedStaff.shift}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Languages</Label>
                    <div className="flex gap-2 mt-2">
                      {selectedStaff.languages.map((lang, idx) => (
                        <Badge key={idx} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedStaff.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Specializations</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedStaff.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="secondary">
                          <Heart className="w-3 h-3 mr-1" />
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Performance</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Experience</span>
                        <span className="font-medium">{selectedStaff.yearsExperience} years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Compliance Score</span>
                        <span className={`font-medium ${getComplianceColor(selectedStaff.complianceScore)}`}>
                          {selectedStaff.complianceScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Training</span>
                        <span className="text-sm">{selectedStaff.nextTraining}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === 'family' && (
                <Alert>
                  <Heart className="h-4 w-4" />
                  <AlertDescription>
                    This staff member is part of your loved one's care team. You can contact them through the community's main line.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}