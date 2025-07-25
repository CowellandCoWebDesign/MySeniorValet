import { db } from './storage';
import { 
  communityDashboardStats, 
  userActivity, 
  securityAuditLogs,
  communityMessages,
  communities
} from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Dashboard Data Seeder - Populates database with realistic analytics data
 * for comprehensive dashboard functionality testing and launch preparation
 */
export class DashboardDataSeeder {
  
  /**
   * Seed community dashboard stats with realistic data for the last 90 days
   */
  async seedCommunityDashboardStats(communityId: number, daysBack: number = 90) {
    console.log(`🌱 Seeding dashboard stats for community ${communityId} (${daysBack} days)`);
    
    const stats = [];
    const baseDate = new Date();
    
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic daily stats with natural variation
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const multiplier = isWeekend ? 0.6 : 1.0; // Lower weekend activity
      
      stats.push({
        communityId,
        date: dateStr,
        profileViews: Math.floor(Math.random() * 50 * multiplier) + 10,
        searchImpressions: Math.floor(Math.random() * 100 * multiplier) + 20,
        searchClicks: Math.floor(Math.random() * 15 * multiplier) + 2,
        familyInquiries: Math.floor(Math.random() * 8 * multiplier) + 1,
        tourRequests: Math.floor(Math.random() * 4 * multiplier) + 0,
        phoneCallClicks: Math.floor(Math.random() * 12 * multiplier) + 2,
        photoViews: Math.floor(Math.random() * 30 * multiplier) + 5,
        reviewClicks: Math.floor(Math.random() * 8 * multiplier) + 1,
        shareActions: Math.floor(Math.random() * 3 * multiplier) + 0,
        favoriteActions: Math.floor(Math.random() * 5 * multiplier) + 0,
        qualifiedLeads: Math.floor(Math.random() * 3 * multiplier) + 0,
        tourConversions: Math.floor(Math.random() * 2 * multiplier) + 0,
        avgTimeOnPage: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
        returnVisitors: Math.floor(Math.random() * 10 * multiplier) + 1
      });
    }
    
    // Insert stats in batches
    const batchSize = 30;
    for (let i = 0; i < stats.length; i += batchSize) {
      const batch = stats.slice(i, i + batchSize);
      await db.insert(communityDashboardStats).values(batch).onConflictDoNothing();
    }
    
    return stats.length;
  }
  
  /**
   * Seed user activity data for realistic analytics
   */
  async seedUserActivity(userId: number, activityCount: number = 100) {
    console.log(`🌱 Seeding user activity for user ${userId} (${activityCount} activities)`);
    
    const activities = [];
    const actions = [
      'login', 'search', 'community_view', 'favorite_add', 'favorite_remove',
      'tour_request', 'phone_click', 'share_community', 'photo_view',
      'filter_change', 'map_interaction', 'logout'
    ];
    
    for (let i = 0; i < activityCount; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      activities.push({
        userId,
        action,
        details: {
          page: action.includes('community') ? `/community/${Math.floor(Math.random() * 100) + 1}` : '/',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
        },
        timestamp,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
      });
    }
    
    await db.insert(userActivity).values(activities);
    return activities.length;
  }
  
  /**
   * Seed security audit logs for admin dashboard
   */
  async seedSecurityAuditLogs(logCount: number = 200) {
    console.log(`🌱 Seeding security audit logs (${logCount} logs)`);
    
    const logs = [];
    const actions = ['login', 'logout', 'failed_login', 'password_change', 'profile_update', 'admin_access'];
    const riskLevels = ['low', 'medium', 'high', 'critical'] as const;
    const userIds = [39096632, 1, 2, 3, 4]; // Sample user IDs
    
    for (let i = 0; i < logCount; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const action = actions[Math.floor(Math.random() * actions.length)];
      const success = Math.random() > 0.1; // 90% success rate
      const riskLevel = success ? 'low' : riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      logs.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)].toString(),
        action,
        resource: action.includes('admin') ? '/admin' : '/dashboard',
        ipAddress: `10.0.0.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        success,
        riskLevel,
        timestamp,
        details: {
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
          requestId: `req_${Math.random().toString(36).substr(2, 9)}`
        }
      });
    }
    
    await db.insert(securityAuditLogs).values(logs);
    return logs.length;
  }
  
  /**
   * Seed realistic community messages for testing
   */
  async seedCommunityMessages(communityId: number, messageCount: number = 20) {
    console.log(`🌱 Seeding community messages for community ${communityId} (${messageCount} messages)`);
    
    const messages = [];
    const subjects = [
      'Assisted Living Inquiry for Mother',
      'Memory Care Services Question',
      'Tour Request - This Weekend',
      'Pricing Information Request',
      'Availability for Move-in',
      'Special Care Requirements',
      'Family Visit Planning',
      'Insurance Coverage Question'
    ];
    
    const careTypes = ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing'];
    const moveInTimelines = ['Within 1 month', 'Within 3 months', 'Within 6 months', 'Within 1 year'];
    const priorities = ['low', 'medium', 'high', 'urgent'] as const;
    const statuses = ['unread', 'read', 'responded', 'archived'] as const;
    
    for (let i = 0; i < messageCount; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      messages.push({
        communityId,
        senderName: `${['John', 'Sarah', 'Michael', 'Lisa', 'David', 'Jennifer'][Math.floor(Math.random() * 6)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller'][Math.floor(Math.random() * 6)]}`,
        senderEmail: `${Math.random().toString(36).substr(2, 8)}@example.com`,
        senderPhone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        subject,
        message: `Hi, I'm interested in learning more about your ${careTypes[Math.floor(Math.random() * careTypes.length)]} services. Could we schedule a time to discuss options and pricing?`,
        messageType: 'inquiry',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status,
        careLevel: careTypes[Math.floor(Math.random() * careTypes.length)],
        moveInTimeline: moveInTimelines[Math.floor(Math.random() * moveInTimelines.length)],
        budget: {
          min: Math.floor(Math.random() * 3000) + 2000,
          max: Math.floor(Math.random() * 4000) + 4000
        },
        responseTime: status === 'responded' ? Math.floor(Math.random() * 480) + 30 : null, // 30-510 minutes
        respondedAt: status === 'responded' ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        createdAt
      });
    }
    
    await db.insert(communityMessages).values(messages);
    return messages.length;
  }
  
  /**
   * Seed comprehensive data for multiple communities
   */
  async seedAllDashboardData(communityIds: number[] = [], options: {
    daysBack?: number;
    messagesPerCommunity?: number;
    userActivities?: number;
    auditLogs?: number;
  } = {}) {
    const {
      daysBack = 90,
      messagesPerCommunity = 15,
      userActivities = 100,
      auditLogs = 200
    } = options;
    
    console.log('🌱 Starting comprehensive dashboard data seeding...');
    
    // If no community IDs provided, get first 10 claimed communities
    if (communityIds.length === 0) {
      const claimedCommunities = await db
        .select({ communityId: communities.id })
        .from(communities)
        .where(sql`${communities.claimedBy} IS NOT NULL`)
        .limit(10);
      
      communityIds = claimedCommunities.map(c => c.communityId);
    }
    
    let totalStats = 0;
    let totalMessages = 0;
    
    // Seed data for each community
    for (const communityId of communityIds) {
      const statsCount = await this.seedCommunityDashboardStats(communityId, daysBack);
      const messagesCount = await this.seedCommunityMessages(communityId, messagesPerCommunity);
      
      totalStats += statsCount;
      totalMessages += messagesCount;
    }
    
    // Seed user activity data
    const userActivityCount = await this.seedUserActivity(39096632, userActivities); // Current user
    
    // Seed security audit logs
    const auditLogCount = await this.seedSecurityAuditLogs(auditLogs);
    
    console.log('✅ Dashboard data seeding completed:', {
      communitiesProcessed: communityIds.length,
      totalStats,
      totalMessages,
      userActivityCount,
      auditLogCount
    });
    
    return {
      communitiesProcessed: communityIds.length,
      totalStats,
      totalMessages,
      userActivityCount,
      auditLogCount
    };
  }
}

export const dashboardDataSeeder = new DashboardDataSeeder();