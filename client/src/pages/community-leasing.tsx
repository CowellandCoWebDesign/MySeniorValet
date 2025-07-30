import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Users,
  Calendar,
  DollarSign,
  FileSignature,
  ChevronRight,
  Download,
  Send,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Home,
  User,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  MoreVertical,
  FileCheck,
  UserCheck,
  Building,
  Briefcase,
} from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";

// Application status colors
const statusColors = {
  "Draft": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "Submitted": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  "Under Review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
  "Documents Requested": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
  "Approved": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  "Rejected": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  "Cancelled": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "Expired": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

// DocuSign status colors
const docusignStatusColors = {
  "Not Started": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "Sent": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  "Delivered": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
  "Signed": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  "Completed": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  "Declined": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  "Voided": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

// Quick application form schema
const quickApplicationSchema = z.object({
  applicantFirstName: z.string().min(2, "First name is required"),
  applicantLastName: z.string().min(2, "Last name is required"),
  applicantEmail: z.string().email("Valid email is required"),
  applicantPhone: z.string().min(10, "Phone number is required"),
  careLevel: z.enum(["Independent Living", "Assisted Living", "Memory Care", "Skilled Nursing"]),
  preferredMoveInDate: z.string().optional(),
  preferredUnitType: z.string().optional(),
  notes: z.string().optional(),
});

export default function CommunityLeasingDashboard() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewApplicationDialog, setShowNewApplicationDialog] = useState(false);

  const form = useForm<z.infer<typeof quickApplicationSchema>>({
    resolver: zodResolver(quickApplicationSchema),
    defaultValues: {
      applicantFirstName: "",
      applicantLastName: "",
      applicantEmail: "",
      applicantPhone: "",
      careLevel: "Assisted Living",
      preferredMoveInDate: "",
      preferredUnitType: "",
      notes: "",
    },
  });

  // Fetch community details
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  // Check if user has permission to access this dashboard
  const { data: claimedCommunity } = useQuery({
    queryKey: [`/api/communities/${id}/claim-status`],
    enabled: !!id && !!user,
  });

  // Fetch leasing applications
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: [`/api/communities/${id}/leasing/applications`],
    enabled: !!id && !!claimedCommunity,
  });

  // Fetch lease agreements
  const { data: leases = [] } = useQuery({
    queryKey: [`/api/communities/${id}/leasing/agreements`],
    enabled: !!id && !!claimedCommunity,
  });

  // Fetch leasing tasks
  const { data: tasks = [] } = useQuery({
    queryKey: [`/api/communities/${id}/leasing/tasks`],
    enabled: !!id && !!claimedCommunity,
  });

  // Fetch DocuSign templates
  const { data: templates = [] } = useQuery({
    queryKey: [`/api/communities/${id}/docusign/templates`],
    enabled: !!id && !!claimedCommunity,
  });

  // Create new application mutation
  const createApplicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof quickApplicationSchema>) => {
      return apiRequest(`/api/communities/${id}/leasing/applications`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/leasing/applications`] });
      toast({
        title: "Application Created",
        description: "New lease application has been created successfully.",
      });
      setShowNewApplicationDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = searchQuery === "" ||
      app.applicantFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalApplications: applications.length,
    pendingReview: applications.filter((app: any) => app.status === "Under Review").length,
    activeLeases: leases.filter((lease: any) => lease.status === "Active").length,
    pendingTasks: tasks.filter((task: any) => task.status === "Pending").length,
  };

  // Loading state
  if (communityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leasing dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied if not claimed community owner
  if (!claimedCommunity || claimedCommunity.ownerId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this community's leasing dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation(`/community/${id}`)}>
              Return to Community Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Leasing Management
              </h1>
              <p className="text-muted-foreground mt-1">{community?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setLocation(`/community-portal/${id}`)}>
                <Building className="h-4 w-4 mr-2" />
                Portal Home
              </Button>
              <Dialog open={showNewApplicationDialog} onOpenChange={setShowNewApplicationDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Application</DialogTitle>
                    <DialogDescription>
                      Start a new lease application for a prospective resident.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createApplicationMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="applicantFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="applicantLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="applicantEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="applicantPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="careLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Care Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Independent Living">Independent Living</SelectItem>
                                <SelectItem value="Assisted Living">Assisted Living</SelectItem>
                                <SelectItem value="Memory Care">Memory Care</SelectItem>
                                <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferredMoveInDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Move-in Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowNewApplicationDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createApplicationMutation.isPending}>
                          {createApplicationMutation.isPending ? "Creating..." : "Create Application"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">Requires action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLeases}</div>
              <p className="text-xs text-muted-foreground">Current residents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">To complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="leases">Leases</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="docusign">DocuSign</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lease Applications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Documents Requested">Documents Requested</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application: any) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/community-portal/${id}/leasing/application/${application.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>
                                {application.applicantFirstName[0]}{application.applicantLastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">
                                {application.applicantFirstName} {application.applicantLastName}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {application.applicantEmail}
                                </span>
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {application.applicantPhone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                                {application.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {application.careLevel}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                        {application.preferredMoveInDate && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Preferred move-in: {format(new Date(application.preferredMoveInDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leases Tab */}
          <TabsContent value="leases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Lease Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                {leases.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active leases</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leases.map((lease: any) => (
                      <div
                        key={lease.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/community-portal/${id}/leasing/lease/${lease.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Unit {lease.unitNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              Lease #{lease.leaseNumber} • {lease.unitType}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${lease.monthlyRent}/month</p>
                            <Badge className={statusColors[lease.status as keyof typeof statusColors]}>
                              {lease.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leasing Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending tasks</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{task.taskTitle}</h4>
                            <p className="text-sm text-muted-foreground">{task.taskType}</p>
                          </div>
                          <Badge
                            variant={task.priority === "Urgent" ? "destructive" : "default"}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.dueDate && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DocuSign Tab */}
          <TabsContent value="docusign" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>DocuSign Templates</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No DocuSign templates configured</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add templates to streamline your document signing process
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((template: any) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{template.templateName}</h4>
                            <p className="text-sm text-muted-foreground">{template.templateType}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {template.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DocuSign Integration Status */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>DocuSign Integration:</strong> Connect your DocuSign account to enable electronic document signing for leases and applications.
                <Button variant="link" className="px-0 ml-2" onClick={() => setLocation(`/community-portal/${id}/settings`)}>
                  Configure Integration →
                </Button>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}