// Notification email configuration for MySeniorValet
// All admin/notification emails route exclusively to the site owner

export const NOTIFICATION_EMAIL_CONFIG = {
  // Super Admin emails (private)
  superAdmin: {
    primary: 'CowellandCoWebDesign@gmail.com'
  },
  
  // Notification routing rules - all go to owner for now
  routing: {
    systemAlerts: ['superAdmin.primary'],
    vendorSignups: ['superAdmin.primary'],
    paymentIssues: ['superAdmin.primary'],
    communityMilestones: ['superAdmin.primary'],
    userContributions: ['superAdmin.primary'],
    analyticsReports: ['superAdmin.primary'],
    securityAlerts: ['superAdmin.primary'],
    userRegistrations: ['superAdmin.primary'],
    supportRequests: ['superAdmin.primary']
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
    }
  }
  
  return [...new Set(emails)];
}

// Helper function to check if an email is a super admin email
export function isSuperAdminEmail(email: string): boolean {
  return email === NOTIFICATION_EMAIL_CONFIG.superAdmin.primary;
}

// Helper function to get notification sender email
export function getNotificationSenderEmail(): string {
  return 'hello@myseniorvalet.com';
}
