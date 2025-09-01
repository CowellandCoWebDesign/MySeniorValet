import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageSquare, 
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Star,
  MapPin,
  Camera,
  Settings,
  FileText,
  DollarSign,
  Home,
  Search,
  Target,
  Award,
  Clock,
  ArrowRight,
  Download,
  Upload,
  Edit,
  Save,
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Building,
  TestTube
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import EngagementScorecard from "@/components/EngagementScorecard";
import { EnterpriseMarketAnalysis } from "@/components/EnterpriseMarketAnalysis";
import { CRMIntegrationPanel } from "@/components/CRMIntegrationPanel";
import { RMSIntegrationPanel } from "@/components/RMSIntegrationPanel";
import { TourManagement } from "@/components/TourManagement";
import { EnterpriseAnalytics } from "@/components/enterprise/EnterpriseAnalytics";
import { FinancialManagement } from "@/components/enterprise/FinancialManagement";
import { ComplianceMonitoring } from "@/components/enterprise/ComplianceMonitoring";
import { ResidentManagement } from "@/components/enterprise/ResidentManagement";
import { StaffManagement } from "@/components/enterprise/StaffManagement";
import { MaintenanceSystem } from "@/components/enterprise/MaintenanceSystem";
import { MarketingAnalytics } from "@/components/enterprise/MarketingAnalytics";
import { FamilyPortal } from "@/components/enterprise/FamilyPortal";
import { VendorManagement } from "@/components/enterprise/VendorManagement";
import { QualityMetrics } from "@/components/enterprise/QualityMetrics";
import { EmergencyResponse } from "@/components/enterprise/EmergencyResponse";
import { DocumentManagement } from "@/components/enterprise/DocumentManagement";
import { BusinessIntelligence } from "@/components/enterprise/BusinessIntelligence";
import { ExternalIntegrations } from "@/components/enterprise/ExternalIntegrations";
import { AuditTrail } from "@/components/enterprise/AuditTrail";
import { CustomReporting } from "@/components/enterprise/CustomReporting";
import { RoleBasedAccess } from "@/components/enterprise/RoleBasedAccess";
import { RealTimeNotifications } from "@/components/enterprise/RealTimeNotifications";

export default function CommunityDashboard() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEnterpriseFeatures, setShowEnterpriseFeatures] = useState(false);
  
  // Check if community has enterprise access (featured or platinum tier)
  const hasEnterpriseAccess = community?.subscriptionTier && 
    ['featured', 'platinum'].includes(community.subscriptionTier);
  const [selectedDateRange, setSelectedDateRange] = useState("30");
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for contact information
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    website: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Fetch community details including subscription tier
  const { data: community, isLoading: communityLoading } = useQuery<any>({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id && !!user,
  });

  // Update form when community data loads
  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name || '',
        description: community.description || '',
        phone: community.phone || '',
        website: community.website || '',
        email: community.email || '',
        address: community.address || '',
        city: community.city || '',
        state: community.state || '',
        zipCode: community.zipCode || ''
      });
    }
  }, [community]);

  // Fetch community dashboard overview
  const { data: overview, isLoading: overviewLoading } = useQuery<any>({
    queryKey: [`/api/communities/${id}/dashboard/overview`],
    enabled: !!id && !!user,
  });

  // Fetch community messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: [`/api/communities/${id}/dashboard/messages`],
    enabled: !!id && !!user,
  });

  // Fetch performance metrics
  const { data: performance, isLoading: performanceLoading } = useQuery<any>({
    queryKey: [`/api/communities/${id}/dashboard/performance`],
    enabled: !!id && !!user,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ reportType, dateRange, format }: any) => {
      const response = await apiRequest("POST", `/api/communities/${id}/dashboard/reports`, {
        reportType,
        dateRange,
        format
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    }
  });

  // Update community mutation
  const updateCommunityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/communities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your community information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}`] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update community information.",
        variant: "destructive",
      });
    }
  });

  const handleSaveChanges = () => {
    updateCommunityMutation.mutate(formData);
  };

  const handleViewPublicProfile = () => {
    window.open(`/communities/${id}`, '_blank');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`text-xs flex items-center mt-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(change)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MessageCard = ({ message }: any) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {message.senderName?.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-sm">{message.senderName}</h4>
              <p className="text-xs text-muted-foreground">{message.senderEmail}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
              {message.priority}
            </Badge>
            <Badge variant={message.status === 'unread' ? 'default' : 'outline'}>
              {message.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h5 className="font-medium text-sm mb-2">{message.subject}</h5>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{message.message}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Care: {message.careLevel}</span>
            <span>Timeline: {message.moveInTimeline}</span>
            {message.budget && (
              <span>Budget: ${message.budget.min?.toLocaleString()} - ${message.budget.max?.toLocaleString()}</span>
            )}
          </div>
          <span>{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
        </div>
        <div className="flex space-x-2 mt-3">
          <Button size="sm" className="h-7 text-xs">Reply</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">Schedule Tour</Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs">Archive</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Community Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your community profile, view analytics, and respond to inquiries
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setLocation('/dashboard-testing')}
                variant="outline"
                className="flex items-center gap-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <TestTube className="w-4 h-4" />
                Test Dashboard
              </Button>
              <Button
                onClick={handleViewPublicProfile}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
              </Button>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => generateReportMutation.mutate({
                  reportType: 'analytics',
                  dateRange: selectedDateRange,
                  format: 'pdf'
                })}
                disabled={generateReportMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Status Card - Enhanced with tier features */}
        {community && (
          <Card className={`mb-8 overflow-hidden ${
            community.subscriptionTier === 'platinum' ? 'border-2 border-amber-500 dark:border-amber-600' :
            community.subscriptionTier === 'featured' ? 'border-2 border-purple-500 dark:border-purple-600' :
            community.subscriptionTier === 'standard' ? 'border-2 border-blue-500 dark:border-blue-600' :
            'border-2 border-gray-300 dark:border-gray-700'
          }`}>
            <div className={`h-2 ${
              community.subscriptionTier === 'platinum' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
              community.subscriptionTier === 'featured' ? 'bg-gradient-to-r from-purple-400 to-violet-500' :
              community.subscriptionTier === 'standard' ? 'bg-gradient-to-r from-blue-400 to-sky-500' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`} />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Building className={`w-8 h-8 ${
                      community.subscriptionTier === 'platinum' ? 'text-amber-600' :
                      community.subscriptionTier === 'featured' ? 'text-purple-600' :
                      community.subscriptionTier === 'standard' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} />
                    <div>
                      <CardTitle className="text-2xl">
                        {community.subscriptionTier === 'platinum' && 'Platinum Community Dashboard'}
                        {community.subscriptionTier === 'featured' && 'Featured Community Dashboard'}
                        {community.subscriptionTier === 'standard' && 'Standard Community Dashboard'}
                        {(community.subscriptionTier === 'verified' || !community.subscriptionTier) && 'Verified Community Dashboard'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Welcome to your enhanced community management portal
                      </p>
                    </div>
                  </div>
                </div>
                {community.subscriptionTier !== 'platinum' && (
                  <Button
                    onClick={() => {
                      sessionStorage.setItem('communityUpgradeData', JSON.stringify({
                        communityId: id,
                        communityName: community.name,
                        currentTier: community.subscriptionTier || 'verified',
                        isNewCommunity: false
                      }));
                      setLocation('/community-portal');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tier Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Plan Features</p>
                    <Badge 
                      variant="default" 
                      className={`mb-3 ${
                        community.subscriptionTier === 'platinum' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        community.subscriptionTier === 'featured' ? 'bg-gradient-to-r from-purple-500 to-violet-500' :
                        community.subscriptionTier === 'standard' ? 'bg-gradient-to-r from-blue-500 to-sky-500' :
                        'bg-gray-600'
                      }`}
                    >
                      {community.subscriptionTier?.charAt(0).toUpperCase() + community.subscriptionTier?.slice(1) || 'Verified'} Tier
                    </Badge>
                    <div className="space-y-1 text-xs">
                      {community.subscriptionTier === 'platinum' && (
                        <>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Up to 50 photos</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> 3 videos (5 mins each)</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Unlimited PDFs</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Top Concierge Priority</p>
                        </>
                      )}
                      {community.subscriptionTier === 'featured' && (
                        <>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Up to 25 photos</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> 1 video (2 mins)</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Up to 3 PDFs</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Featured placement</p>
                        </>
                      )}
                      {community.subscriptionTier === 'standard' && (
                        <>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Up to 10 photos</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> 1 brochure PDF</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Basic analytics</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Review responses</p>
                        </>
                      )}
                      {(community.subscriptionTier === 'verified' || !community.subscriptionTier) && (
                        <>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> 1 photo upload</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Tour scheduler</p>
                          <p className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> Basic listing</p>
                          <p className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-600" /> Limited features</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Billing Status</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">Active</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {community.subscriptionTier === 'verified' ? 'Free tier - No payment required' : 
                       community.subscriptionTier === 'platinum' ? '$349/month' :
                       community.subscriptionTier === 'featured' ? '$249/month' :
                       community.subscriptionTier === 'standard' ? '$149/month' : 'Contact support'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Actions</p>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setActiveTab("profile")}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit Profile
                      </Button>
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setActiveTab("photos")}>
                        <Camera className="w-3 h-3 mr-1" />
                        Manage Photos
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Welcome Message for New Communities */}
                {community.createdAt && new Date(community.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">Welcome to MySeniorValet!</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Your community has been successfully registered. Start by completing your profile and uploading photos to attract more families.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Hero Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.overview?.profileViews?.toLocaleString() || "0"}</div>
                <div className="text-blue-100 text-sm">Total Views</div>
                <div className="mt-2 flex items-center justify-center text-xs">
                  {overview?.trends?.viewsChange >= 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(overview?.trends?.viewsChange || 0)}% vs last period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.overview?.familyInquiries?.toLocaleString() || "0"}</div>
                <div className="text-blue-100 text-sm">Family Inquiries</div>
                <div className="mt-2 flex items-center justify-center text-xs">
                  {overview?.trends?.inquiriesChange >= 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(overview?.trends?.inquiriesChange || 0)}% vs last period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.overview?.tourRequests?.toLocaleString() || "0"}</div>
                <div className="text-blue-100 text-sm">Tour Requests</div>
                <div className="mt-2 flex items-center justify-center text-xs">
                  {overview?.trends?.toursChange >= 0 ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  <span>{Math.abs(overview?.trends?.toursChange || 0)}% vs last period</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{overview?.leadQuality?.conversionRate || "0"}%</div>
                <div className="text-blue-100 text-sm">Conversion Rate</div>
                <div className="mt-2 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                  Industry avg: 12%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${
            community?.subscriptionTier === 'platinum' ? 'grid-cols-11' : 
            (community?.subscriptionTier === 'featured' || community?.subscriptionTier === 'standard') ? 'grid-cols-8' : 
            'grid-cols-7'
          }`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {(['featured', 'platinum'].includes(community?.subscriptionTier)) && (
              <TabsTrigger value="tours">3D Tours</TabsTrigger>
            )}
            {community?.subscriptionTier === 'platinum' && (
              <>
                <TabsTrigger value="crm">CRM Integration</TabsTrigger>
                <TabsTrigger value="rms">Revenue Management</TabsTrigger>
                <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
              </>
            )}
            {/* Enterprise Features for Featured/Platinum Tiers */}
            {hasEnterpriseAccess && (
              <>
                <TabsTrigger value="enterprise-analytics">Enterprise Analytics</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="residents">Residents</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="family">Family Portal</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="rbac">Access Control</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </>
            )}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-time Activity Feed */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                    Real-time Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profile views (last hour)</span>
                      <span className="font-semibold">42</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active visitors now</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tour requests today</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unread messages</span>
                      <span className="font-semibold text-orange-600">5</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Response time avg</span>
                      <span className="font-semibold text-blue-600">15 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Engagement Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">Key metrics across all channels</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Search Visibility</span>
                          <span className="text-sm font-semibold">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Profile Completeness</span>
                          <span className="text-sm font-semibold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Response Rate</span>
                          <span className="text-sm font-semibold">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Review Score</span>
                          <span className="text-sm font-semibold">4.7/5</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Photo Quality</span>
                          <span className="text-sm font-semibold">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Tour Conversion</span>
                          <span className="text-sm font-semibold">24%</span>
                        </div>
                        <Progress value={24} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compact Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Search Impressions</p>
                      <p className="text-xl font-bold text-green-600">
                        {overview?.overview?.searchImpressions?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <Search className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Phone Clicks</p>
                      <p className="text-xl font-bold text-blue-600">
                        {overview?.overview?.phoneCallClicks?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <Phone className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Review Score</p>
                      <p className="text-xl font-bold text-purple-600">
                        4.7<span className="text-sm font-normal">/5</span>
                      </p>
                    </div>
                    <Star className="h-6 w-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                      <p className="text-xl font-bold text-orange-600">
                        94<span className="text-sm font-normal">%</span>
                      </p>
                    </div>
                    <Home className="h-6 w-6 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Sources & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Top Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overview?.topSources?.map((source: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.source}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(source.visitors / (overview?.topSources?.[0]?.visitors || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{source.visitors}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Lead Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-lg font-bold text-green-600">{overview?.leadQuality?.conversionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <span className="text-lg font-bold text-blue-600">{overview?.leadQuality?.avgResponseTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tour to Move-In</span>
                      <span className="text-lg font-bold text-purple-600">{overview?.leadQuality?.tourToMoveInRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Messages Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                    Recent Messages
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("messages")}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(0, 3).map((message: any) => (
                    <MessageCard key={message.id} message={message} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Scorecard Tab */}
          <TabsContent value="engagement" className="space-y-6">
            {community && (
              <EngagementScorecard communityId={parseInt(id || '0')} />
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Family Messages & Inquiries</h2>
              <div className="flex space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                messages.map((message: any) => (
                  <MessageCard key={message.id} message={message} />
                ))
              )}
            </div>
          </TabsContent>

          {/* Profile Management Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    Community Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Community Name</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your Community Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Tell families about your community..." 
                      className="min-h-[100px]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(555) 123-4567" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="contact@community.com" 
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Website</label>
                      <Input 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="www.yourcommunity.com" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <Input 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="123 Main Street" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <Input 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="City" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <Input 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="State" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Zip Code</label>
                      <Input 
                        value={formData.zipCode}
                        onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        placeholder="12345" 
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      This information will be visible on your public community profile page.
                    </p>
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={updateCommunityMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {updateCommunityMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-green-600" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop photos here, or click to browse
                    </p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, WebP. Max 5MB per file.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Pricing & Availability</h2>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Real-Time Updates
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Pricing by Care Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Independent Living</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Assisted Living</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Memory Care</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Skilled Nursing</label>
                      <div className="flex space-x-2">
                        <Input placeholder="Min" />
                        <Input placeholder="Max" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                    Unit Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Available Units</label>
                      <Input placeholder="e.g., 5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Units</label>
                      <Input placeholder="e.g., 120" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Availability Status</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Waitlist">Waitlist</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2 text-purple-600" />
                    Search Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Search Position</span>
                      <Badge variant="outline">#{performance?.searchRanking?.currentPosition}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Position (30d)</span>
                      <Badge variant="outline">#{performance?.searchRanking?.averagePosition}</Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Top Keywords</span>
                      {performance?.searchRanking?.topKeywords?.map((keyword: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>"{keyword.keyword}"</span>
                          <div className="flex items-center space-x-2">
                            <span>Pos #{keyword.position}</span>
                            <span className="text-muted-foreground">{keyword.searches} searches</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-orange-600" />
                    Profile Completeness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Profile Score</span>
                        <span className="text-sm font-bold">{performance?.profileCompleteness?.score}%</span>
                      </div>
                      <Progress value={performance?.profileCompleteness?.score} className="h-2" />
                    </div>
                    <div>
                      <span className="text-sm font-medium mb-2 block">Missing Elements</span>
                      <div className="space-y-1">
                        {performance?.profileCompleteness?.missingElements?.map((element: string, index: number) => (
                          <div key={index} className="flex items-center text-xs text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mr-2 text-orange-500" />
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Advanced Analytics & Intelligence</h3>
              <AdvancedAnalytics timeRange="30d" showExport={true} autoRefresh={false} />
            </div>
          </TabsContent>

          {/* 3D Tours Tab - Featured and Platinum */}
          {(['featured', 'platinum'].includes(community?.subscriptionTier)) && (
            <TabsContent value="tours" className="space-y-6">
              <TourManagement 
                communityId={parseInt(id || '0')} 
                subscriptionTier={community.subscriptionTier || 'verified'} 
              />
            </TabsContent>
          )}

          {/* CRM Integration Tab - Platinum Only */}
          {community?.subscriptionTier === 'platinum' && (
            <>
              <TabsContent value="crm" className="space-y-6">
                <CRMIntegrationPanel communityId={parseInt(id || '0')} />
              </TabsContent>
              
              <TabsContent value="rms" className="space-y-6">
                <RMSIntegrationPanel communityId={parseInt(id || '0')} />
              </TabsContent>
            </>
          )}

          {/* Enterprise Market Analysis Tab - Platinum Only */}
          {community?.subscriptionTier === 'platinum' && (
            <TabsContent value="market-analysis" className="space-y-6">
              <EnterpriseMarketAnalysis 
                communityId={parseInt(id || '0')} 
                communityName={community?.name || ''} 
                currentLocation={{ lat: community?.latitude || 0, lng: community?.longitude || 0 }}
              />
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  Dashboard Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Notifications</label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Auto-Response</label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="business-hours">Business hours only</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Auto-Response Message</label>
                  <Textarea 
                    placeholder="Thank you for your inquiry. We'll respond within 24 hours..."
                    className="min-h-[80px]"
                  />
                </div>
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enterprise Features Tabs - Available for Featured/Platinum Tiers */}
          {hasEnterpriseAccess && (
            <>
              {/* Enterprise Analytics Tab */}
              <TabsContent value="enterprise-analytics" className="space-y-6">
                <EnterpriseAnalytics communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Financial Management Tab */}
              <TabsContent value="financial" className="space-y-6">
                <FinancialManagement communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Compliance Monitoring Tab */}
              <TabsContent value="compliance" className="space-y-6">
                <ComplianceMonitoring communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Resident Management Tab */}
              <TabsContent value="residents" className="space-y-6">
                <ResidentManagement communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Staff Management Tab */}
              <TabsContent value="staff" className="space-y-6">
                <StaffManagement communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Maintenance System Tab */}
              <TabsContent value="maintenance" className="space-y-6">
                <MaintenanceSystem communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Marketing Analytics Tab */}
              <TabsContent value="marketing" className="space-y-6">
                <MarketingAnalytics communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Family Portal Tab */}
              <TabsContent value="family" className="space-y-6">
                <FamilyPortal communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Vendor Management Tab */}
              <TabsContent value="vendors" className="space-y-6">
                <VendorManagement communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Quality Metrics Tab */}
              <TabsContent value="quality" className="space-y-6">
                <QualityMetrics communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Emergency Response Tab */}
              <TabsContent value="emergency" className="space-y-6">
                <EmergencyResponse communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Document Management Tab */}
              <TabsContent value="documents" className="space-y-6">
                <DocumentManagement communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Business Intelligence Tab */}
              <TabsContent value="intelligence" className="space-y-6">
                <BusinessIntelligence communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* External Integrations Tab */}
              <TabsContent value="integrations" className="space-y-6">
                <ExternalIntegrations communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Audit Trail Tab */}
              <TabsContent value="audit" className="space-y-6">
                <AuditTrail communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Custom Reporting Tab */}
              <TabsContent value="reports" className="space-y-6">
                <CustomReporting communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Role-Based Access Control Tab */}
              <TabsContent value="rbac" className="space-y-6">
                <RoleBasedAccess communityId={parseInt(id || '0')} />
              </TabsContent>

              {/* Real-Time Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <RealTimeNotifications communityId={parseInt(id || '0')} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}