import { sendEmail, notifySuperAdmin } from '../sendgrid-service';
import { db } from '../db';
import { users, communities, vendors } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { NotificationMonitor } from './notification-monitor';
import { NotificationPreferencesService } from './notification-preferences';

interface NotificationData {
  type: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  timestamp: string;
  data: any;
}

export class ComprehensiveNotificationService {
  
  // 1. COMMUNITY MANAGEMENT NOTIFICATIONS
  static async notifyCommunityClaimSubmitted(claimData: {
    communityId: number;
    communityName: string;
    claimantName: string;
    claimantEmail: string;
    claimantPhone: string;
    message: string;
  }) {
    const notification: NotificationData = {
      type: 'COMMUNITY_CLAIM',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: claimData
    };

    await notifySuperAdmin(
      '🏢 New Community Claim Submitted',
      `${claimData.claimantName} has submitted a claim for ${claimData.communityName}`,
      notification
    );

    // Send confirmation to claimant
    await sendEmail({
      to: claimData.claimantEmail,
      from: 'hello@myseniorvalet.com',
      subject: 'Community Claim Received - MySeniorValet',
      html: `
        <h2>Thank you for claiming ${claimData.communityName}</h2>
        <p>We've received your claim request and will review it within 24-48 hours.</p>
        <p>You'll receive a confirmation email once your claim is verified.</p>
        <p>Questions? Contact us at hello@myseniorvalet.com</p>
      `
    });

    return notification;
  }

  static async notifyCommunityVerified(communityData: {
    communityId: number;
    communityName: string;
    ownerEmail: string;
    verificationStatus: string;
  }) {
    const notification: NotificationData = {
      type: 'COMMUNITY_VERIFIED',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: communityData
    };

    await notifySuperAdmin(
      '✅ Community Verified',
      `${communityData.communityName} has been verified`,
      notification
    );

    await sendEmail({
      to: communityData.ownerEmail,
      from: 'hello@myseniorvalet.com',
      subject: '✅ Your Community is Verified - MySeniorValet',
      html: `
        <h2>Congratulations! ${communityData.communityName} is now verified</h2>
        <p>Your community now displays the verified badge and has access to premium features.</p>
        <p>Next steps:</p>
        <ul>
          <li>Update your community profile</li>
          <li>Add photos and virtual tours</li>
          <li>Respond to reviews and messages</li>
        </ul>
      `
    });

    return notification;
  }

  static async notifyCommunitySubscriptionChange(subscriptionData: {
    communityId: number;
    communityName: string;
    oldTier: string;
    newTier: string;
    ownerEmail: string;
  }) {
    const notification: NotificationData = {
      type: 'COMMUNITY_SUBSCRIPTION_CHANGE',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: subscriptionData
    };

    await notifySuperAdmin(
      '💳 Community Subscription Changed',
      `${subscriptionData.communityName} changed from ${subscriptionData.oldTier} to ${subscriptionData.newTier}`,
      notification
    );

    return notification;
  }

  // 2. TOUR SYSTEM NOTIFICATIONS
  static async notifyTourScheduled(tourData: {
    tourId?: string;
    communityId: number;
    communityName: string;
    visitorName: string;
    visitorEmail: string;
    tourDate: string;
    tourTime: string;
    phoneNumber?: string;
  }) {
    const notification: NotificationData = {
      type: 'TOUR_SCHEDULED',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: tourData
    };

    await notifySuperAdmin(
      '📅 New Tour Scheduled',
      `${tourData.visitorName} scheduled a tour at ${tourData.communityName} for ${tourData.tourDate} at ${tourData.tourTime}`,
      notification
    );

    // Send confirmation to visitor
    await sendEmail({
      to: tourData.visitorEmail,
      from: 'hello@myseniorvalet.com',
      subject: `Tour Confirmed - ${tourData.communityName}`,
      html: `
        <h2>Your tour is confirmed!</h2>
        <p><strong>Community:</strong> ${tourData.communityName}</p>
        <p><strong>Date:</strong> ${tourData.tourDate}</p>
        <p><strong>Time:</strong> ${tourData.tourTime}</p>
        <p>We've notified the community and they'll be ready to welcome you.</p>
        <p>Need to reschedule? Reply to this email or call the community directly.</p>
      `
    });

    // TODO: Send to community when they have email configured
    
    return notification;
  }

  static async notifyTourCompleted(tourData: {
    tourId: string;
    communityName: string;
    visitorName: string;
    rating: number;
    feedback: string;
  }) {
    const notification: NotificationData = {
      type: 'TOUR_COMPLETED',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: tourData
    };

    await notifySuperAdmin(
      '✅ Tour Completed & Reviewed',
      `${tourData.visitorName} completed tour at ${tourData.communityName} - Rating: ${tourData.rating}/5`,
      notification
    );

    return notification;
  }

  static async notifyTourCancelled(tourData: {
    tourId: string;
    communityName: string;
    visitorName: string;
    reason?: string;
  }) {
    const notification: NotificationData = {
      type: 'TOUR_CANCELLED',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: tourData
    };

    await notifySuperAdmin(
      '❌ Tour Cancelled',
      `${tourData.visitorName} cancelled tour at ${tourData.communityName}`,
      notification
    );

    return notification;
  }

  // 3. VENDOR MARKETPLACE NOTIFICATIONS
  static async notifyVendorRegistration(vendorData: {
    businessName: string;
    contactName: string;
    email: string;
    serviceType: string;
    tierKey: string;
  }) {
    const notification: NotificationData = {
      type: 'VENDOR_REGISTRATION',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: vendorData
    };

    await notifySuperAdmin(
      '🛍️ New Vendor Registration',
      `${vendorData.businessName} (${vendorData.serviceType}) registered for ${vendorData.tierKey} tier`,
      notification
    );

    await sendEmail({
      to: vendorData.email,
      from: 'hello@myseniorvalet.com',
      subject: 'Welcome to MySeniorValet Marketplace',
      html: `
        <h2>Welcome ${vendorData.businessName}!</h2>
        <p>Your vendor account has been created successfully.</p>
        <p><strong>Service Type:</strong> ${vendorData.serviceType}</p>
        <p><strong>Subscription Tier:</strong> ${vendorData.tierKey}</p>
        <p>Next steps:</p>
        <ul>
          <li>Complete your business profile</li>
          <li>Add service areas and pricing</li>
          <li>Upload business certifications</li>
        </ul>
        <p>Questions? Contact our vendor support at billing@myseniorvalet.com</p>
      `
    });

    return notification;
  }

  static async notifyVendorApproved(vendorData: {
    vendorId: string;
    businessName: string;
    email: string;
  }) {
    const notification: NotificationData = {
      type: 'VENDOR_APPROVED',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: vendorData
    };

    await notifySuperAdmin(
      '✅ Vendor Approved',
      `${vendorData.businessName} has been approved for the marketplace`,
      notification
    );

    await sendEmail({
      to: vendorData.email,
      from: 'hello@myseniorvalet.com',
      subject: '✅ Your Business is Approved - MySeniorValet Marketplace',
      html: `
        <h2>Congratulations! ${vendorData.businessName} is approved</h2>
        <p>Your business is now live on the MySeniorValet Marketplace.</p>
        <p>Families can now find and contact your services.</p>
      `
    });

    return notification;
  }

  static async notifyVendorServiceBooked(bookingData: {
    vendorName: string;
    vendorEmail: string;
    customerName: string;
    customerEmail: string;
    serviceType: string;
    bookingDate: string;
  }) {
    const notification: NotificationData = {
      type: 'VENDOR_SERVICE_BOOKED',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: bookingData
    };

    await notifySuperAdmin(
      '📦 Vendor Service Booked',
      `${bookingData.customerName} booked ${bookingData.serviceType} from ${bookingData.vendorName}`,
      notification
    );

    // Notify vendor
    await sendEmail({
      to: bookingData.vendorEmail,
      from: 'hello@myseniorvalet.com',
      subject: '🎉 New Service Booking',
      html: `
        <h2>You have a new booking!</h2>
        <p><strong>Customer:</strong> ${bookingData.customerName}</p>
        <p><strong>Service:</strong> ${bookingData.serviceType}</p>
        <p><strong>Date:</strong> ${bookingData.bookingDate}</p>
        <p>Please contact the customer at ${bookingData.customerEmail} to confirm details.</p>
      `
    });

    return notification;
  }

  // 4. PAYMENT NOTIFICATIONS
  static async notifyPaymentSuccess(paymentData: {
    amount: number;
    customerEmail: string;
    customerName?: string;
    description: string;
    communityId?: number;
    vendorId?: string;
  }) {
    const notification: NotificationData = {
      type: 'PAYMENT_SUCCESS',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: paymentData
    };

    await notifySuperAdmin(
      '💰 Payment Received',
      `$${(paymentData.amount / 100).toFixed(2)} from ${paymentData.customerEmail} for ${paymentData.description}`,
      notification
    );

    await sendEmail({
      to: paymentData.customerEmail,
      from: 'hello@myseniorvalet.com',
      subject: 'Payment Confirmation - MySeniorValet',
      html: `
        <h2>Payment Confirmed</h2>
        <p>Thank you for your payment of $${(paymentData.amount / 100).toFixed(2)}</p>
        <p><strong>Description:</strong> ${paymentData.description}</p>
        <p>A full receipt has been sent to this email address.</p>
        <p>Questions about your payment? Contact billing@myseniorvalet.com</p>
      `
    });

    return notification;
  }

  static async notifyPaymentFailed(paymentData: {
    amount: number;
    customerEmail: string;
    error: string;
    description: string;
  }) {
    const notification: NotificationData = {
      type: 'PAYMENT_FAILED',
      priority: 'critical',
      timestamp: new Date().toISOString(),
      data: paymentData
    };

    await notifySuperAdmin(
      '❌ Payment Failed',
      `Payment of $${(paymentData.amount / 100).toFixed(2)} failed for ${paymentData.customerEmail}`,
      notification
    );

    await sendEmail({
      to: paymentData.customerEmail,
      from: 'hello@myseniorvalet.com',
      subject: 'Payment Issue - Action Required',
      html: `
        <h2>Payment Could Not Be Processed</h2>
        <p>We were unable to process your payment of $${(paymentData.amount / 100).toFixed(2)}</p>
        <p><strong>Reason:</strong> ${paymentData.error}</p>
        <p>Please update your payment method or contact billing@myseniorvalet.com for assistance.</p>
      `
    });

    return notification;
  }

  static async notifySubscriptionRenewal(subscriptionData: {
    customerEmail: string;
    planName: string;
    amount: number;
    nextBillingDate: string;
  }) {
    const notification: NotificationData = {
      type: 'SUBSCRIPTION_RENEWAL',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: subscriptionData
    };

    await notifySuperAdmin(
      '🔄 Subscription Renewed',
      `${subscriptionData.customerEmail} renewed ${subscriptionData.planName} for $${(subscriptionData.amount / 100).toFixed(2)}`,
      notification
    );

    return notification;
  }

  // 5. SECURITY NOTIFICATIONS
  static async notifySecurityAlert(alertData: {
    alertType: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    userId?: string;
  }) {
    const notification: NotificationData = {
      type: 'SECURITY_ALERT',
      priority: alertData.severity as any,
      timestamp: new Date().toISOString(),
      data: alertData
    };

    await notifySuperAdmin(
      `🚨 Security Alert (${alertData.severity.toUpperCase()})`,
      alertData.description,
      notification
    );

    return notification;
  }

  static async notifyFailedLoginAttempts(attemptData: {
    email: string;
    ipAddress: string;
    attempts: number;
  }) {
    const notification: NotificationData = {
      type: 'FAILED_LOGIN_ATTEMPTS',
      priority: 'high',
      timestamp: new Date().toISOString(),
      data: attemptData
    };

    await notifySuperAdmin(
      '⚠️ Multiple Failed Login Attempts',
      `${attemptData.attempts} failed login attempts for ${attemptData.email} from IP ${attemptData.ipAddress}`,
      notification
    );

    return notification;
  }

  // 6. SYSTEM NOTIFICATIONS
  static async notifySystemAlert(systemData: {
    alertType: string;
    message: string;
    severity: 'warning' | 'error' | 'critical';
    metrics?: any;
  }) {
    const notification: NotificationData = {
      type: 'SYSTEM_ALERT',
      priority: systemData.severity === 'critical' ? 'critical' : 'high',
      timestamp: new Date().toISOString(),
      data: systemData
    };

    await notifySuperAdmin(
      `🖥️ System Alert: ${systemData.alertType}`,
      systemData.message,
      notification
    );

    return notification;
  }

  static async notifyDatabaseThreshold(dbData: {
    usage: number;
    threshold: number;
    action: string;
  }) {
    const notification: NotificationData = {
      type: 'DATABASE_THRESHOLD',
      priority: dbData.usage > 90 ? 'critical' : 'high',
      timestamp: new Date().toISOString(),
      data: dbData
    };

    await notifySuperAdmin(
      '💾 Database Usage Alert',
      `Database at ${dbData.usage}% capacity (threshold: ${dbData.threshold}%)`,
      notification
    );

    return notification;
  }

  static async notifyErrorSpike(errorData: {
    errorCount: number;
    timeWindow: string;
    topErrors: string[];
  }) {
    const notification: NotificationData = {
      type: 'ERROR_SPIKE',
      priority: 'critical',
      timestamp: new Date().toISOString(),
      data: errorData
    };

    await notifySuperAdmin(
      '📈 Error Rate Spike Detected',
      `${errorData.errorCount} errors in the last ${errorData.timeWindow}`,
      notification
    );

    return notification;
  }

  // 7. EMERGENCY NOTIFICATIONS
  static async notifyEmergencyContact(emergencyData: {
    userName: string;
    userEmail?: string;
    userLocation?: string;
    message: string;
    contactNumber?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }) {
    const notification: NotificationData = {
      type: 'EMERGENCY_CONTACT',
      priority: 'critical',
      timestamp: new Date().toISOString(),
      data: emergencyData
    };

    // Send to both admin emails immediately
    const recipients = ['admin@myseniorvalet.com', 'william.cowell01@gmail.com'];
    
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient,
        from: 'hello@myseniorvalet.com',
        subject: `🚨 EMERGENCY CONTACT - ${emergencyData.urgency.toUpperCase()} Priority`,
        html: `
          <div style="border: 3px solid red; padding: 20px; background: #fee;">
            <h2 style="color: red;">🚨 EMERGENCY CONTACT REQUEST</h2>
            <p><strong>Name:</strong> ${emergencyData.userName}</p>
            <p><strong>Email:</strong> ${emergencyData.userEmail || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${emergencyData.contactNumber || 'Not provided'}</p>
            <p><strong>Location:</strong> ${emergencyData.userLocation || 'Not provided'}</p>
            <p><strong>Urgency:</strong> ${emergencyData.urgency.toUpperCase()}</p>
            <h3>Message:</h3>
            <p style="background: white; padding: 15px; border-left: 4px solid red;">
              ${emergencyData.message}
            </p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      });
    }

    // Send confirmation to user if email provided
    if (emergencyData.userEmail) {
      await sendEmail({
        to: emergencyData.userEmail,
        from: 'hello@myseniorvalet.com',
        subject: 'Emergency Contact Request Received',
        html: `
          <h2>We've Received Your Emergency Request</h2>
          <p>Our team has been notified and will respond as quickly as possible.</p>
          <p>If this is a life-threatening emergency, please call 911 immediately.</p>
          <p>Your request priority: <strong>${emergencyData.urgency.toUpperCase()}</strong></p>
        `
      });
    }

    return notification;
  }

  // 8. USER REGISTRATION (Enhanced)
  static async notifyUserRegistration(userData: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    accountType: string;
    businessName?: string;
  }) {
    const notification: NotificationData = {
      type: 'USER_REGISTRATION',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      data: userData
    };

    const userTypeLabel = userData.accountType === 'family' ? 'Family Member' :
                         userData.accountType === 'community' ? 'Community Manager' :
                         userData.accountType === 'vendor' ? 'Vendor' : userData.accountType;

    await notifySuperAdmin(
      `👤 New ${userTypeLabel} Registration`,
      `${userData.firstName || ''} ${userData.lastName || ''} (${userData.email}) registered as ${userTypeLabel}`,
      notification
    );

    // Different welcome emails based on account type
    const welcomeMessages = {
      family: {
        subject: 'Welcome to MySeniorValet - Everything You Need, Nothing You Pay',
        html: `
          <h2>Welcome ${userData.firstName || 'to MySeniorValet'}!</h2>
          <p>Your free family account gives you access to:</p>
          <ul>
            <li>35,264+ senior living communities</li>
            <li>Transparent pricing including HUD rates</li>
            <li>Real availability updates</li>
            <li>Tour scheduling tools</li>
            <li>Family collaboration features</li>
          </ul>
          <p>Start searching for the perfect community at myseniorvalet.com</p>
        `
      },
      community: {
        subject: 'Welcome Community Partner - MySeniorValet',
        html: `
          <h2>Welcome ${userData.businessName || userData.firstName}!</h2>
          <p>Your community account has been created.</p>
          <p>Next steps:</p>
          <ul>
            <li>Claim your community listing</li>
            <li>Update your profile and photos</li>
            <li>Set your pricing and availability</li>
            <li>Respond to tour requests</li>
          </ul>
          <p>Questions? Contact hello@myseniorvalet.com</p>
        `
      },
      vendor: {
        subject: 'Welcome to MySeniorValet Marketplace',
        html: `
          <h2>Welcome ${userData.businessName || userData.firstName}!</h2>
          <p>Your vendor account has been created.</p>
          <p>Complete your profile to start receiving leads from families searching for services.</p>
          <p>Vendor support: billing@myseniorvalet.com</p>
        `
      }
    };

    const message = welcomeMessages[userData.accountType as keyof typeof welcomeMessages] || welcomeMessages.family;

    await sendEmail({
      to: userData.email,
      from: 'hello@myseniorvalet.com',
      subject: message.subject,
      html: message.html
    });

    return notification;
  }

  // AGGREGATED DAILY SUMMARY
  static async sendDailySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Collect metrics for the day
    const metrics = {
      newUsers: 0, // Query from database
      newCommunityRegistrations: 0,
      newVendorRegistrations: 0,
      toursScheduled: 0,
      paymentsProcessed: 0,
      totalRevenue: 0,
      securityAlerts: 0,
      systemErrors: 0
    };

    // TODO: Query actual metrics from database

    await notifySuperAdmin(
      '📊 Daily Platform Summary',
      `Platform activity for ${today.toLocaleDateString()}`,
      metrics
    );
  }
}

// Export for use in routes
export default ComprehensiveNotificationService;