// Notification email configuration for MySeniorValet
// This file manages email routing for different notification types

export const NOTIFICATION_EMAIL_CONFIG = {
  // Super Admin emails (private)
  superAdmin: {
    primary: 'William.cowell01@gmail.com',
    backup: 'CowellandCoWebDesign@gmail.com'
  },
  
  // Team emails (public facing)
  team: {
    onboarding: 'hello@myseniorvalet.com',
    billing: 'billing@myseniorvalet.com'
  },
  
  // Notification routing rules
  routing: {
    // System alerts and critical notifications
    systemAlerts: ['superAdmin.primary', 'superAdmin.backup'],
    
    // New vendor registrations
    vendorSignups: ['team.onboarding', 'superAdmin.primary'],
    
    // Payment and billing issues
    paymentIssues: ['team.billing', 'superAdmin.primary'],
    
    // Community updates and milestones
    communityMilestones: ['superAdmin.primary'],
    
    // User feedback and contributions
    userContributions: ['team.onboarding', 'superAdmin.primary'],
    
    // Platform analytics and reports
    analyticsReports: ['superAdmin.primary'],
    
    // Security alerts
    securityAlerts: ['superAdmin.primary', 'superAdmin.backup'],
    
    // New user registrations
    userRegistrations: ['team.onboarding'],
    
    // Support requests
    supportRequests: ['team.onboarding', 'superAdmin.primary']
  }
};

// Helper function to get email addresses for a notification type
export function getEmailsForNotificationType(type: keyof typeof NOTIFICATION_EMAIL_CONFIG.routing): string[] {
  const routes = NOTIFICATION_EMAIL_CONFIG.routing[type] || [];
  const emails: string[] = [];
  
  for (const route of routes) {
    const [category, key] = route.split('.');
    
    if (category === 'superAdmin') {
      const superAdminEmails = NOTIFICATION_EMAIL_CONFIG.superAdmin;
      const email = superAdminEmails[key as keyof typeof superAdminEmails];
      if (email) emails.push(email);
    } else if (category === 'team') {
      const teamEmails = NOTIFICATION_EMAIL_CONFIG.team;
      const email = teamEmails[key as keyof typeof teamEmails];
      if (email) emails.push(email);
    }
  }
  
  return [...new Set(emails)]; // Remove duplicates
}

// Helper function to check if an email is a super admin email
export function isSuperAdminEmail(email: string): boolean {
  return email === NOTIFICATION_EMAIL_CONFIG.superAdmin.primary || 
         email === NOTIFICATION_EMAIL_CONFIG.superAdmin.backup;
}

// Helper function to get notification sender email
export function getNotificationSenderEmail(): string {
  return 'notifications@myseniorvalet.com';
}