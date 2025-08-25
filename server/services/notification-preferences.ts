import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface NotificationPreferences {
  // Email preferences
  emailEnabled: boolean;
  emailTypes: {
    tourScheduled: boolean;
    tourReminder: boolean;
    tourCompleted: boolean;
    communityUpdates: boolean;
    vendorMessages: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
  };
  
  // In-app preferences
  inAppEnabled: boolean;
  inAppTypes: {
    tourScheduled: boolean;
    communityMessages: boolean;
    vendorOffers: boolean;
    systemNotices: boolean;
  };
  
  // SMS preferences (future)
  smsEnabled: boolean;
  smsPhone?: string;
  smsTypes: {
    tourReminders: boolean;
    urgentAlerts: boolean;
  };
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  timezone: string; // "America/New_York"
  
  // Frequency controls
  maxEmailsPerDay: number;
  maxNotificationsPerHour: number;
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  emailTypes: {
    tourScheduled: true,
    tourReminder: true,
    tourCompleted: true,
    communityUpdates: true,
    vendorMessages: true,
    systemAlerts: true,
    marketingEmails: false,
    weeklyDigest: true
  },
  inAppEnabled: true,
  inAppTypes: {
    tourScheduled: true,
    communityMessages: true,
    vendorOffers: false,
    systemNotices: true
  },
  smsEnabled: false,
  smsTypes: {
    tourReminders: false,
    urgentAlerts: false
  },
  quietHoursEnabled: false,
  timezone: 'America/New_York',
  maxEmailsPerDay: 20,
  maxNotificationsPerHour: 10,
  digestFrequency: 'weekly'
};

export class NotificationPreferencesService {
  private static userPreferences = new Map<number, NotificationPreferences>();
  private static emailCounts = new Map<string, { count: number; resetTime: Date }>();

  static async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    // Check cache first
    if (this.userPreferences.has(userId)) {
      return this.userPreferences.get(userId)!;
    }

    try {
      // Load from database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (user?.notificationPreferences) {
        const prefs = user.notificationPreferences as NotificationPreferences;
        this.userPreferences.set(userId, prefs);
        return prefs;
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }

    // Return defaults
    return DEFAULT_PREFERENCES;
  }

  static async updateUserPreferences(
    userId: number, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const currentPrefs = await this.getUserPreferences(userId);
    const updatedPrefs = { ...currentPrefs, ...preferences };

    try {
      // Save to database
      await db
        .update(users)
        .set({ 
          notificationPreferences: updatedPrefs,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Update cache
      this.userPreferences.set(userId, updatedPrefs);

      console.log(`✅ Updated notification preferences for user ${userId}`);
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  static async shouldSendNotification(
    userId: number,
    notificationType: string,
    channel: 'email' | 'inApp' | 'sms'
  ): Promise<boolean> {
    const prefs = await this.getUserPreferences(userId);

    // Check if channel is enabled
    if (channel === 'email' && !prefs.emailEnabled) return false;
    if (channel === 'inApp' && !prefs.inAppEnabled) return false;
    if (channel === 'sms' && !prefs.smsEnabled) return false;

    // Check specific notification type
    if (channel === 'email') {
      const emailType = notificationType as keyof typeof prefs.emailTypes;
      if (prefs.emailTypes[emailType] === false) return false;
    }

    if (channel === 'inApp') {
      const inAppType = notificationType as keyof typeof prefs.inAppTypes;
      if (prefs.inAppTypes[inAppType] === false) return false;
    }

    if (channel === 'sms') {
      const smsType = notificationType as keyof typeof prefs.smsTypes;
      if (prefs.smsTypes[smsType] === false) return false;
    }

    // Check quiet hours
    if (prefs.quietHoursEnabled && prefs.quietHoursStart && prefs.quietHoursEnd) {
      const now = new Date();
      const currentHour = now.getHours();
      const startHour = parseInt(prefs.quietHoursStart.split(':')[0]);
      const endHour = parseInt(prefs.quietHoursEnd.split(':')[0]);

      if (startHour > endHour) {
        // Quiet hours span midnight
        if (currentHour >= startHour || currentHour < endHour) {
          console.log(`🔕 Notification blocked during quiet hours for user ${userId}`);
          return false;
        }
      } else {
        // Normal quiet hours
        if (currentHour >= startHour && currentHour < endHour) {
          console.log(`🔕 Notification blocked during quiet hours for user ${userId}`);
          return false;
        }
      }
    }

    // Check rate limits
    if (channel === 'email') {
      const userEmail = `user_${userId}`;
      const emailCount = this.getEmailCount(userEmail);
      
      if (emailCount >= prefs.maxEmailsPerDay) {
        console.log(`📧 Daily email limit reached for user ${userId} (${emailCount}/${prefs.maxEmailsPerDay})`);
        return false;
      }
    }

    return true;
  }

  private static getEmailCount(identifier: string): number {
    const now = new Date();
    const record = this.emailCounts.get(identifier);

    if (!record || record.resetTime < now) {
      // Reset count for new day
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      this.emailCounts.set(identifier, {
        count: 0,
        resetTime: tomorrow
      });
      return 0;
    }

    return record.count;
  }

  static incrementEmailCount(identifier: string) {
    const record = this.emailCounts.get(identifier);
    if (record) {
      record.count++;
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      this.emailCounts.set(identifier, {
        count: 1,
        resetTime: tomorrow
      });
    }
  }

  static async getPreferenceSummary(userId: number) {
    const prefs = await this.getUserPreferences(userId);
    
    const enabledEmailTypes = Object.entries(prefs.emailTypes)
      .filter(([, enabled]) => enabled)
      .map(([type]) => type);

    const enabledInAppTypes = Object.entries(prefs.inAppTypes)
      .filter(([, enabled]) => enabled)
      .map(([type]) => type);

    return {
      email: {
        enabled: prefs.emailEnabled,
        types: enabledEmailTypes,
        maxPerDay: prefs.maxEmailsPerDay
      },
      inApp: {
        enabled: prefs.inAppEnabled,
        types: enabledInAppTypes
      },
      sms: {
        enabled: prefs.smsEnabled,
        phone: prefs.smsPhone
      },
      quietHours: prefs.quietHoursEnabled ? {
        start: prefs.quietHoursStart,
        end: prefs.quietHoursEnd,
        timezone: prefs.timezone
      } : null,
      digestFrequency: prefs.digestFrequency
    };
  }

  // Preset templates for quick configuration
  static getPresetTemplates() {
    return {
      essential: {
        name: 'Essential Only',
        description: 'Only critical notifications',
        preferences: {
          emailEnabled: true,
          emailTypes: {
            tourScheduled: true,
            tourReminder: true,
            tourCompleted: false,
            communityUpdates: false,
            vendorMessages: false,
            systemAlerts: true,
            marketingEmails: false,
            weeklyDigest: false
          },
          maxEmailsPerDay: 5
        }
      },
      balanced: {
        name: 'Balanced',
        description: 'Important updates without overwhelming',
        preferences: {
          emailEnabled: true,
          emailTypes: {
            tourScheduled: true,
            tourReminder: true,
            tourCompleted: true,
            communityUpdates: true,
            vendorMessages: true,
            systemAlerts: true,
            marketingEmails: false,
            weeklyDigest: true
          },
          maxEmailsPerDay: 10
        }
      },
      everything: {
        name: 'Everything',
        description: 'All notifications and updates',
        preferences: {
          emailEnabled: true,
          emailTypes: {
            tourScheduled: true,
            tourReminder: true,
            tourCompleted: true,
            communityUpdates: true,
            vendorMessages: true,
            systemAlerts: true,
            marketingEmails: true,
            weeklyDigest: true
          },
          maxEmailsPerDay: 50
        }
      },
      silent: {
        name: 'Silent Mode',
        description: 'No email notifications',
        preferences: {
          emailEnabled: false,
          inAppEnabled: true
        }
      }
    };
  }
}