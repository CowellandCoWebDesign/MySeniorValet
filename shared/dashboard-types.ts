// Enterprise Dashboard Type Definitions

export interface PlatformStats {
  totalCommunities: number;
  statesCovered: number;
  activeUsers: number;
  userGrowth: number;
  revenue: number;
  systemHealth: number;
  newCommunities: number;
  pendingClaims: number;
  activeVendors: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export interface CommunityAnalytics {
  totalCommunities: number;
  activeCommunities: number;
  totalViews: number;
  tourRequests: number;
  pendingTours: number;
  averageRating: number;
  totalReviews: number;
  occupancyRate: number;
  monthlyRevenue: number;
  inquiries: number;
  messages: number;
  responseTime: string;
}

export interface VendorStats {
  activeServices: number;
  totalServices: number;
  leadsThisMonth: number;
  conversionRate: number;
  revenue: number;
  averageRating: number;
  totalReviews: number;
  completedJobs: number;
  pendingLeads: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  serviceCategories: string[];
}

export interface UserDashboardData {
  savedCommunities: number;
  recentSearches: number;
  scheduledTours: number;
  familyMembers: number;
  notifications: number;
  messages: number;
  favorites: any[];
  tourHistory: any[];
  searchHistory: any[];
  recommendations: any[];
}

export interface SecurityAuditLog {
  id: number;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  riskScore: number;
  blocked: boolean;
  details: any;
}

export interface UserManagementData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  users: Array<{
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    lastLoginAt: string;
    isActive: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }>;
  roleDistribution: Record<string, number>;
}

export interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  subscriptions: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePer
: number;
  topCommunities: Array<{
    name: string;
    revenue: number;
    growth: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface VendorLead {
  id: number;
  serviceRequested: string;
  customerName: string;
  location: string;
  budget: string;
  status: 'new' | 'contacted' | 'negotiating' | 'won' | 'lost';
  createdAt: string;
  value: number;
  notes: string;
}

export interface VendorService {
  id: number;
  name: string;
  category: string;
  description: string;
  pricing: string;
  availability: string;
  rating: number;
  completedJobs: number;
}

export interface CommunityMessage {
  id: number;
  from: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'inquiry' | 'tour_request' | 'general';
}

export interface TourRequest {
  id: number;
  communityName: string;
  requestedDate: string;
  requestedTime: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}